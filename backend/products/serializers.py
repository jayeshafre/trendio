from rest_framework import serializers
from .models import Category, Product


class CategorySerializer(serializers.ModelSerializer):
    """
    Serializer for product categories.
    """
    product_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = (
            'id', 'name', 'slug', 'description',
            'image', 'is_active', 'product_count', 'created_at'
        )
        read_only_fields = ('id', 'slug', 'created_at')

    def get_product_count(self, obj):
        return obj.products.filter(is_active=True).count()


class ProductListSerializer(serializers.ModelSerializer):
    """
    Serializer for product LIST view.
    Lighter — only essential fields.
    """
    category_name       = serializers.CharField(
                            source='category.name',
                            read_only=True
                          )
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock         = serializers.ReadOnlyField()

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'slug', 'price', 'compare_price',
            'image', 'category_name', 'is_featured',
            'discount_percentage', 'is_in_stock', 'stock'
        )


class ProductDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for product DETAIL view.
    Full information including category details.
    """
    category            = CategorySerializer(read_only=True)
    category_id         = serializers.PrimaryKeyRelatedField(
                            queryset=Category.objects.all(),
                            source='category',
                            write_only=True,
                            required=False
                          )
    discount_percentage = serializers.ReadOnlyField()
    is_in_stock         = serializers.ReadOnlyField()

    class Meta:
        model  = Product
        fields = (
            'id', 'name', 'slug', 'description', 'price',
            'compare_price', 'image', 'stock', 'sku',
            'is_active', 'is_featured', 'category', 'category_id',
            'discount_percentage', 'is_in_stock',
            'created_at', 'updated_at'
        )
        read_only_fields = ('id', 'slug', 'created_at', 'updated_at')