from rest_framework import serializers
from .models import Order, OrderItem


class OrderItemSerializer(serializers.ModelSerializer):
    """Serializer for items within an order."""

    class Meta:
        model  = OrderItem
        fields = (
            'id', 'product', 'product_name', 'product_image',
            'product_price', 'quantity', 'subtotal'
        )


class OrderSerializer(serializers.ModelSerializer):
    """Full order serializer with all items."""
    items                = OrderItemSerializer(many=True, read_only=True)
    grand_total          = serializers.ReadOnlyField()
    can_cancel           = serializers.ReadOnlyField()
    status_display_info  = serializers.ReadOnlyField()
    status_display       = serializers.CharField(
                            source='get_status_display',
                            read_only=True
                           )

    class Meta:
        model  = Order
        fields = (
            'id', 'order_number', 'status', 'status_display',
            'status_display_info', 'items',
            'total_amount', 'delivery_charge', 'grand_total',
            'full_name', 'phone',
            'address_line1', 'address_line2',
            'city', 'state', 'pincode', 'notes',
            'can_cancel', 'created_at', 'updated_at'
        )
        read_only_fields = (
            'id', 'order_number', 'status',
            'total_amount', 'delivery_charge',
            'created_at', 'updated_at'
        )


class OrderListSerializer(serializers.ModelSerializer):
    """
    Lighter serializer for order LIST view.
    No items — just summary info.
    """
    grand_total         = serializers.ReadOnlyField()
    can_cancel          = serializers.ReadOnlyField()
    status_display      = serializers.CharField(
                            source='get_status_display',
                            read_only=True
                          )
    status_display_info = serializers.ReadOnlyField()
    item_count          = serializers.SerializerMethodField()

    class Meta:
        model  = Order
        fields = (
            'id', 'order_number', 'status', 'status_display',
            'status_display_info', 'item_count',
            'total_amount', 'delivery_charge', 'grand_total',
            'full_name', 'city', 'can_cancel', 'created_at'
        )

    def get_item_count(self, obj):
        return obj.items.count()


class PlaceOrderSerializer(serializers.Serializer):
    """
    Serializer for placing a new order.
    Takes delivery address details.
    """
    full_name     = serializers.CharField(max_length=200)
    phone         = serializers.CharField(max_length=15)
    address_line1 = serializers.CharField(max_length=300)
    address_line2 = serializers.CharField(max_length=300, required=False, allow_blank=True)
    city          = serializers.CharField(max_length=100)
    state         = serializers.CharField(max_length=100)
    pincode       = serializers.CharField(max_length=10)
    notes         = serializers.CharField(required=False, allow_blank=True)

    def validate_phone(self, value):
        if not value.isdigit() or len(value) < 10:
            raise serializers.ValidationError(
                "Enter a valid 10-digit phone number."
            )
        return value

    def validate_pincode(self, value):
        if not value.isdigit() or len(value) != 6:
            raise serializers.ValidationError(
                "Enter a valid 6-digit pincode."
            )
        return value


class UpdateOrderStatusSerializer(serializers.Serializer):
    """Admin only — update order status."""
    status = serializers.ChoiceField(
        choices=Order.Status.choices
    )