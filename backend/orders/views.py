from rest_framework import status, permissions, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from cart.models import Cart
from products.models import Product
from django.db.models import Sum, Count
from users.models import CustomUser
from .models import Order, OrderItem
from .serializers import (
    OrderSerializer,
    OrderListSerializer,
    PlaceOrderSerializer,
    UpdateOrderStatusSerializer
)


class PlaceOrderView(APIView):
    """
    POST /api/orders/place/
    Convert cart to order.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        # ── Step 1: Validate delivery address ─────────────────
        serializer = PlaceOrderSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        address = serializer.validated_data

        # ── Step 2: Get user's cart ────────────────────────────
        try:
            cart = Cart.objects.prefetch_related(
                'items__product'
            ).get(user=request.user)
        except Cart.DoesNotExist:
            return Response(
                {'error': 'Cart not found.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        if not cart.items.exists():
            return Response(
                {'error': 'Your cart is empty. Add items before placing order.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Step 3: Validate stock for all items ───────────────
        for cart_item in cart.items.all():
            product = cart_item.product
            if not product.is_active:
                return Response(
                    {'error': f'"{product.name}" is no longer available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )
            if cart_item.quantity > product.stock:
                return Response(
                    {'error': f'Only {product.stock} units of "{product.name}" available.'},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # ── Step 4: Calculate totals ───────────────────────────
        total_amount    = cart.total_price
        delivery_charge = 0 if total_amount >= 999 else 99

        # ── Step 5: Create the Order ───────────────────────────
        order = Order.objects.create(
            user            = request.user,
            total_amount    = total_amount,
            delivery_charge = delivery_charge,
            full_name       = address['full_name'],
            phone           = address['phone'],
            address_line1   = address['address_line1'],
            address_line2   = address.get('address_line2', ''),
            city            = address['city'],
            state           = address['state'],
            pincode         = address['pincode'],
            notes           = address.get('notes', ''),
        )

        # ── Step 6: Create Order Items + Reduce Stock ──────────
        for cart_item in cart.items.all():
            product = cart_item.product

            OrderItem.objects.create(
                order         = order,
                product       = product,
                product_name  = product.name,
                product_image = str(product.image) if product.image else '',
                product_price = product.price,
                quantity      = cart_item.quantity,
                subtotal      = product.price * cart_item.quantity,
            )

            # Reduce stock
            product.stock -= cart_item.quantity
            product.save()

        # ── Step 7: Clear the cart ─────────────────────────────
        cart.items.all().delete()

        return Response({
            'message':      f'Order {order.order_number} placed successfully! 🎉',
            'order':        OrderSerializer(order).data,
            'order_number': order.order_number,
        }, status=status.HTTP_201_CREATED)


class OrderListView(generics.ListAPIView):
    """
    GET /api/orders/
    Get all orders for the logged-in user.
    Authentication required.
    """
    serializer_class   = OrderListSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Order.objects.filter(
            user=self.request.user
        ).prefetch_related('items')


class OrderDetailView(APIView):
    """
    GET /api/orders/<order_number>/
    Get full details of a specific order.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        try:
            order = Order.objects.prefetch_related('items__product').get(
                order_number=order_number,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = OrderSerializer(order)
        return Response(serializer.data)


class CancelOrderView(APIView):
    """
    POST /api/orders/<order_number>/cancel/
    Cancel a pending or confirmed order.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request, order_number):
        try:
            order = Order.objects.prefetch_related('items__product').get(
                order_number=order_number,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        if not order.can_cancel:
            return Response(
                {'error': f'Order cannot be cancelled. Current status: {order.get_status_display()}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Restore stock
        for item in order.items.all():
            if item.product:
                item.product.stock += item.quantity
                item.product.save()

        order.status = Order.Status.CANCELLED
        order.save()

        return Response({
            'message': f'Order {order.order_number} cancelled successfully.',
            'order':   OrderSerializer(order).data
        }, status=status.HTTP_200_OK)


# ── Admin Views ───────────────────────────────────────────────

class AdminOrderListView(generics.ListAPIView):
    """
    GET /api/orders/admin/all/
    Admin only — view all orders.
    """
    serializer_class   = OrderListSerializer
    permission_classes = [permissions.IsAdminUser]

    def get_queryset(self):
        queryset = Order.objects.all().prefetch_related('items')

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        return queryset


class AdminUpdateOrderStatusView(APIView):
    """
    PUT /api/orders/admin/<order_number>/status/
    Admin only — update order status.
    """
    permission_classes = [permissions.IsAdminUser]

    def put(self, request, order_number):
        try:
            order = Order.objects.get(order_number=order_number)
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = UpdateOrderStatusSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        old_status    = order.get_status_display()
        order.status  = serializer.validated_data['status']
        order.save()

        return Response({
            'message': f'Order status updated from {old_status} to {order.get_status_display()}.',
            'order':   OrderSerializer(order).data
        }, status=status.HTTP_200_OK)

class AdminDashboardStatsView(APIView):
    """
    GET /api/orders/admin/stats/
    Returns dashboard statistics for admin.
    """
    permission_classes = [permissions.IsAdminUser]

    def get(self, request):
        from products.models import Product, Category

        # ── Order Stats ───────────────────────────────────────
        total_orders    = Order.objects.count()
        pending_orders  = Order.objects.filter(status='pending').count()
        confirmed_orders = Order.objects.filter(status='confirmed').count()
        shipped_orders  = Order.objects.filter(status='shipped').count()
        delivered_orders = Order.objects.filter(status='delivered').count()
        cancelled_orders = Order.objects.filter(status='cancelled').count()

        # ── Revenue ───────────────────────────────────────────
        total_revenue = Order.objects.filter(
            status__in=['confirmed', 'processing', 'shipped', 'delivered']
        ).aggregate(
            total=Sum('total_amount')
        )['total'] or 0

        # ── Product Stats ─────────────────────────────────────
        total_products    = Product.objects.count()
        active_products   = Product.objects.filter(is_active=True).count()
        out_of_stock      = Product.objects.filter(stock=0, is_active=True).count()
        featured_products = Product.objects.filter(is_featured=True).count()

        # ── Category Stats ────────────────────────────────────
        total_categories = Category.objects.count()

        # ── User Stats ────────────────────────────────────────
        total_users = CustomUser.objects.filter(is_staff=False).count()

        # ── Recent Orders ─────────────────────────────────────
        recent_orders = Order.objects.select_related('user').order_by('-created_at')[:5]
        recent_orders_data = [{
            'order_number': o.order_number,
            'user_email':   o.user.email,
            'status':       o.status,
            'grand_total':  str(o.grand_total),
            'created_at':   o.created_at.isoformat(),
        } for o in recent_orders]

        return Response({
            'orders': {
                'total':     total_orders,
                'pending':   pending_orders,
                'confirmed': confirmed_orders,
                'shipped':   shipped_orders,
                'delivered': delivered_orders,
                'cancelled': cancelled_orders,
            },
            'revenue': {
                'total': str(total_revenue),
            },
            'products': {
                'total':    total_products,
                'active':   active_products,
                'out_of_stock': out_of_stock,
                'featured': featured_products,
            },
            'categories': {
                'total': total_categories,
            },
            'users': {
                'total': total_users,
            },
            'recent_orders': recent_orders_data,
        }, status=status.HTTP_200_OK)