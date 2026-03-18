from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from products.models import Product
from .models import Cart, CartItem
from .serializers import (
    CartSerializer,
    AddToCartSerializer,
    UpdateCartItemSerializer
)


def get_or_create_cart(user):
    """Helper — get existing cart or create new one."""
    cart, created = Cart.objects.get_or_create(user=user)
    return cart


class CartView(APIView):
    """
    GET /api/cart/
    View the current user's cart with all items and totals.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        cart = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response(serializer.data, status=status.HTTP_200_OK)


class AddToCartView(APIView):
    """
    POST /api/cart/add/
    Add a product to cart or increase quantity if already exists.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = AddToCartSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        product_id = serializer.validated_data['product_id']
        quantity   = serializer.validated_data['quantity']

        product = Product.objects.get(id=product_id)
        cart    = get_or_create_cart(request.user)

        # Check if item already in cart
        cart_item, created = CartItem.objects.get_or_create(
            cart=cart,
            product=product,
            defaults={'quantity': quantity}
        )

        if not created:
            # Item exists — increase quantity
            new_quantity = cart_item.quantity + quantity

            # Validate stock
            if new_quantity > product.stock:
                return Response({
                    'error': f'Cannot add more. Only {product.stock} items available.'
                }, status=status.HTTP_400_BAD_REQUEST)

            cart_item.quantity = new_quantity
            cart_item.save()
            message = f'Cart updated. {product.name} quantity is now {new_quantity}.'
        else:
            message = f'{product.name} added to cart successfully.'

        # Return updated cart
        cart_serializer = CartSerializer(cart)
        return Response({
            'message': message,
            'cart':    cart_serializer.data
        }, status=status.HTTP_200_OK)


class UpdateCartItemView(APIView):
    """
    PUT /api/cart/update/<item_id>/
    Set exact quantity for a cart item.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, item_id):
        serializer = UpdateCartItemSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        quantity = serializer.validated_data['quantity']

        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Validate stock
        if quantity > cart_item.product.stock:
            return Response({
                'error': f'Only {cart_item.product.stock} items available.'
            }, status=status.HTTP_400_BAD_REQUEST)

        cart_item.quantity = quantity
        cart_item.save()

        cart       = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response({
            'message': 'Cart updated successfully.',
            'cart':    serializer.data
        }, status=status.HTTP_200_OK)


class RemoveCartItemView(APIView):
    """
    DELETE /api/cart/remove/<item_id>/
    Remove a single item from cart.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request, item_id):
        try:
            cart_item = CartItem.objects.get(
                id=item_id,
                cart__user=request.user
            )
        except CartItem.DoesNotExist:
            return Response(
                {'error': 'Cart item not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        product_name = cart_item.product.name
        cart_item.delete()

        cart       = get_or_create_cart(request.user)
        serializer = CartSerializer(cart)
        return Response({
            'message': f'{product_name} removed from cart.',
            'cart':    serializer.data
        }, status=status.HTTP_200_OK)


class ClearCartView(APIView):
    """
    DELETE /api/cart/clear/
    Remove ALL items from cart.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def delete(self, request):
        cart = get_or_create_cart(request.user)
        cart.items.all().delete()

        return Response({
            'message': 'Cart cleared successfully.',
            'cart':    CartSerializer(cart).data
        }, status=status.HTTP_200_OK)


class CartCountView(APIView):
    """
    GET /api/cart/count/
    Get just the cart item count for navbar badge.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        try:
            cart  = Cart.objects.get(user=request.user)
            count = cart.total_items
        except Cart.DoesNotExist:
            count = 0

        return Response({'count': count}, status=status.HTTP_200_OK)