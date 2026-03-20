import razorpay
import hmac
import hashlib
from django.conf import settings
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from django.db import transaction
from orders.models import Order
from .models import Payment
from .serializers import (
    PaymentSerializer,
    CreatePaymentSerializer,
    VerifyPaymentSerializer
)

# Initialize Razorpay client
razorpay_client = razorpay.Client(
    auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET)
)


class CreatePaymentView(APIView):
    """
    POST /api/payments/create/
    Create a Razorpay order for payment.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = CreatePaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        order_number = serializer.validated_data['order_number']

        # Get the order
        try:
            order = Order.objects.get(
                order_number=order_number,
                user=request.user
            )
        except Order.DoesNotExist:
            return Response(
                {'error': 'Order not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check order is not already paid
        if hasattr(order, 'payment') and order.payment.status == Payment.Status.SUCCESS:
            return Response(
                {'error': 'This order is already paid.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Calculate amount in paise (Razorpay uses paise)
        # 1 INR = 100 paise
        amount_paise = int(order.grand_total * 100)

        # Create Razorpay order
        razorpay_order = razorpay_client.order.create({
            'amount':   amount_paise,
            'currency': 'INR',
            'receipt':  order.order_number,
            'notes': {
                'order_number': order.order_number,
                'user_email':   request.user.email,
            }
        })

        # Save payment record in DB
        payment, created = Payment.objects.get_or_create(
            order=order,
            defaults={
                'razorpay_order_id': razorpay_order['id'],
                'amount':            order.grand_total,
                'currency':          'INR',
                'status':            Payment.Status.PENDING,
            }
        )

        # If payment exists but failed, update with new Razorpay order
        if not created and payment.status == Payment.Status.FAILED:
            payment.razorpay_order_id = razorpay_order['id']
            payment.status = Payment.Status.PENDING
            payment.save()

        return Response({
            'razorpay_order_id': razorpay_order['id'],
            'razorpay_key_id':   settings.RAZORPAY_KEY_ID,
            'amount':            amount_paise,
            'currency':          'INR',
            'order_number':      order.order_number,
            'name':              request.user.get_full_name() or request.user.username,
            'email':             request.user.email,
            'phone':             order.phone,
            'description':       f'Payment for Trendio Order {order.order_number}',
        }, status=status.HTTP_200_OK)


class VerifyPaymentView(APIView):
    """
    POST /api/payments/verify/
    Verify Razorpay payment signature after payment.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    @transaction.atomic
    def post(self, request):
        serializer = VerifyPaymentSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        razorpay_order_id   = serializer.validated_data['razorpay_order_id']
        razorpay_payment_id = serializer.validated_data['razorpay_payment_id']
        razorpay_signature  = serializer.validated_data['razorpay_signature']

        # Get payment record
        try:
            payment = Payment.objects.select_related('order').get(
                razorpay_order_id=razorpay_order_id,
                order__user=request.user
            )
        except Payment.DoesNotExist:
            return Response(
                {'error': 'Payment record not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # ── Verify Signature ──────────────────────────────────
        # This is critical — verifies payment is genuinely from Razorpay
        try:
            razorpay_client.utility.verify_payment_signature({
                'razorpay_order_id':   razorpay_order_id,
                'razorpay_payment_id': razorpay_payment_id,
                'razorpay_signature':  razorpay_signature,
            })
        except razorpay.errors.SignatureVerificationError:
            # Signature invalid — mark payment as failed
            payment.status = Payment.Status.FAILED
            payment.save()
            return Response(
                {'error': 'Payment verification failed. Please contact support.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # ── Payment Verified ──────────────────────────────────
        # Update payment record
        payment.razorpay_payment_id = razorpay_payment_id
        payment.razorpay_signature  = razorpay_signature
        payment.status              = Payment.Status.SUCCESS
        payment.save()

        # Update order status to confirmed
        order        = payment.order
        order.status = Order.Status.CONFIRMED
        order.save()

        return Response({
            'message':      'Payment successful! Your order is confirmed. 🎉',
            'order_number': order.order_number,
            'payment_id':   razorpay_payment_id,
            'amount':       payment.amount,
        }, status=status.HTTP_200_OK)


class PaymentFailedView(APIView):
    """
    POST /api/payments/failed/
    Handle failed payment — update payment status.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        razorpay_order_id = request.data.get('razorpay_order_id')

        if not razorpay_order_id:
            return Response(
                {'error': 'Order ID is required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            payment = Payment.objects.get(
                razorpay_order_id=razorpay_order_id,
                order__user=request.user
            )
            payment.status = Payment.Status.FAILED
            payment.save()
        except Payment.DoesNotExist:
            pass

        return Response({
            'message': 'Payment failure recorded.'
        }, status=status.HTTP_200_OK)


class PaymentStatusView(APIView):
    """
    GET /api/payments/status/<order_number>/
    Get payment status for an order.
    Authentication required.
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, order_number):
        try:
            payment = Payment.objects.get(
                order__order_number=order_number,
                order__user=request.user
            )
            serializer = PaymentSerializer(payment)
            return Response(serializer.data)
        except Payment.DoesNotExist:
            return Response(
                {'status': 'not_initiated'},
                status=status.HTTP_200_OK
            )