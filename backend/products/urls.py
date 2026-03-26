from django.urls import path
from . import views

urlpatterns = [
    # Admin only
    path('admin/all/',
         views.AdminProductListView.as_view(),
         name='admin_product_list'),

    # Special routes first
    path('featured/',
         views.FeaturedProductsView.as_view(),
         name='featured_products'),

    path('category/<slug:slug>/',
         views.ProductsByCategoryView.as_view(),
         name='products_by_category'),

    path('categories/',
         views.CategoryListView.as_view(),
         name='category_list'),

    path('categories/<int:pk>/',
         views.CategoryDetailView.as_view(),
         name='category_detail'),

    # Generic routes last
    path('',
         views.ProductListView.as_view(),
         name='product_list'),

    path('<int:pk>/',
         views.ProductDetailView.as_view(),
         name='product_detail'),
]