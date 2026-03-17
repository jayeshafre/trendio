from rest_framework import generics, status, permissions, filters
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from django.db.models import Q
from .models import Category, Product
from .serializers import (
    CategorySerializer,
    ProductListSerializer,
    ProductDetailSerializer
)


# ─── Permission Helper ────────────────────────────────────────
class IsAdminOrReadOnly(permissions.BasePermission):
    """
    Custom permission:
    - Anyone can READ (GET)
    - Only admin can WRITE (POST, PUT, DELETE)
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff


# ══════════════════════════════════════════════════════════════
# CATEGORY VIEWS
# ══════════════════════════════════════════════════════════════

class CategoryListView(generics.ListCreateAPIView):
    """
    GET  /api/products/categories/  → List all categories
    POST /api/products/categories/  → Create category (admin only)
    """
    serializer_class   = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]

    def get_queryset(self):
        # Public sees only active categories
        if self.request.user.is_staff:
            return Category.objects.all()
        return Category.objects.filter(is_active=True)


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/categories/<id>/ → View category
    PUT    /api/products/categories/<id>/ → Update (admin)
    DELETE /api/products/categories/<id>/ → Delete (admin)
    """
    serializer_class   = CategorySerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset           = Category.objects.all()


# ══════════════════════════════════════════════════════════════
# PRODUCT VIEWS
# ══════════════════════════════════════════════════════════════

class ProductListView(generics.ListCreateAPIView):
    """
    GET  /api/products/          → List all products
    POST /api/products/          → Create product (admin only)
    """
    permission_classes = [IsAdminOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser]

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProductDetailSerializer
        return ProductListSerializer

    def get_queryset(self):
        queryset = Product.objects.select_related('category')

        # Non-admin sees only active products
        if not self.request.user.is_staff:
            queryset = queryset.filter(is_active=True)

        # ─── Search ───────────────────────────────────────────
        search = self.request.query_params.get('search')
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search) |
                Q(category__name__icontains=search)
            )

        # ─── Filter by Category ───────────────────────────────
        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__slug=category)

        # ─── Filter by Featured ───────────────────────────────
        featured = self.request.query_params.get('featured')
        if featured == 'true':
            queryset = queryset.filter(is_featured=True)

        # ─── Filter by Price Range ────────────────────────────
        min_price = self.request.query_params.get('min_price')
        max_price = self.request.query_params.get('max_price')
        if min_price:
            queryset = queryset.filter(price__gte=min_price)
        if max_price:
            queryset = queryset.filter(price__lte=max_price)

        # ─── Sorting ──────────────────────────────────────────
        sort = self.request.query_params.get('sort', '-created_at')
        valid_sorts = ['price', '-price', 'name', '-name', '-created_at', 'created_at']
        if sort in valid_sorts:
            queryset = queryset.order_by(sort)

        return queryset

    def create(self, request, *args, **kwargs):
        serializer = ProductDetailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({
            'message': f'Product "{product.name}" created successfully.',
            'product': ProductDetailSerializer(product).data
        }, status=status.HTTP_201_CREATED)


class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    /api/products/<id>/ → View product
    PUT    /api/products/<id>/ → Update product (admin)
    DELETE /api/products/<id>/ → Delete product (admin)
    """
    serializer_class   = ProductDetailSerializer
    permission_classes = [IsAdminOrReadOnly]
    parser_classes     = [MultiPartParser, FormParser]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(is_active=True)

    def update(self, request, *args, **kwargs):
        partial  = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        product = serializer.save()
        return Response({
            'message': f'Product "{product.name}" updated successfully.',
            'product': serializer.data
        })

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        name     = instance.name
        instance.delete()
        return Response(
            {'message': f'Product "{name}" deleted successfully.'},
            status=status.HTTP_200_OK
        )


class FeaturedProductsView(generics.ListAPIView):
    """
    GET /api/products/featured/ → Get featured products
    """
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        return Product.objects.filter(
            is_active=True,
            is_featured=True
        ).select_related('category')[:8]


class ProductsByCategoryView(generics.ListAPIView):
    """
    GET /api/products/category/<slug>/ → Products by category
    """
    serializer_class   = ProductListSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        category_slug = self.kwargs.get('slug')
        return Product.objects.filter(
            is_active=True,
            category__slug=category_slug
        ).select_related('category')