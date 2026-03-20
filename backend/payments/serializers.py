from rest_framework import serializers
from .models import Payment


class PaymentSerializer(serializers.ModelSerializer):
    """Full payment details."""
    order_number = serializers.CharField(
        source='order.order_number',
        read_only=True
    )

    class Meta:
        model  = Payment
        fields = (
            'id', 'order_number', 'razorpay_order_id',
            'razorpay_payment_id', 'amount', 'currency',
            'status', 'created_at'
        )


class CreatePaymentSerializer(serializers.Serializer):
    """
    Initiates payment for a given order number.
    """
    order_number = serializers.CharField(required=True)


class VerifyPaymentSerializer(serializers.Serializer):
    """
    Verifies Razorpay payment after success.
    """
    razorpay_order_id   = serializers.CharField(required=True)
    razorpay_payment_id = serializers.CharField(required=True)
    razorpay_signature  = serializers.CharField(required=True)