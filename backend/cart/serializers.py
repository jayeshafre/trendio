from rest_framework import serializers
from .models import Cart, CartItem
from products.serializers import ProductListSerializer


class CartItemSerializer(serializers.ModelSerializer):
    """
    Serializer for individual cart items.
    """
    product  = ProductListSerializer(read_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model  = CartItem
        fields = ('id', 'product', 'quantity', 'subtotal', 'added_at')
        read_only_fields = ('id', 'added_at')


class CartSerializer(serializers.ModelSerializer):
    """
    Full cart serializer with all items and totals.
    """
    items               = CartItemSerializer(many=True, read_only=True)
    total_items         = serializers.ReadOnlyField()
    total_price         = serializers.ReadOnlyField()
    total_compare_price = serializers.ReadOnlyField()
    total_discount      = serializers.ReadOnlyField()

    class Meta:
        model  = Cart
        fields = (
            'id', 'items',
            'total_items', 'total_price',
            'total_compare_price', 'total_discount',
            'updated_at'
        )


class AddToCartSerializer(serializers.Serializer):
    """
    Serializer for adding a product to cart.
    """
    product_id = serializers.IntegerField(required=True)
    quantity   = serializers.IntegerField(required=True, min_value=1)

    def validate_product_id(self, value):
        from products.models import Product
        try:
            product = Product.objects.get(id=value, is_active=True)
        except Product.DoesNotExist:
            raise serializers.ValidationError("Product not found or unavailable.")
        return value

    def validate(self, attrs):
        from products.models import Product
        product  = Product.objects.get(id=attrs['product_id'])
        quantity = attrs['quantity']

        if quantity > product.stock:
            raise serializers.ValidationError({
                'quantity': f'Only {product.stock} items available in stock.'
            })
        return attrs


class UpdateCartItemSerializer(serializers.Serializer):
    """
    Serializer for updating cart item quantity.
    """
    quantity = serializers.IntegerField(required=True, min_value=1)

    def validate_quantity(self, value):
        return value