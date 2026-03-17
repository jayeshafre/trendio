from django.urls import path
from . import views

urlpatterns = [
    # Categories
    path('categories/',
         views.CategoryListView.as_view(),
         name='category_list'),

    path('categories/<int:pk>/',
         views.CategoryDetailView.as_view(),
         name='category_detail'),

    # Products
    path('',
         views.ProductListView.as_view(),
         name='product_list'),

    path('<int:pk>/',
         views.ProductDetailView.as_view(),
         name='product_detail'),

    # Special Filters
    path('featured/',
         views.FeaturedProductsView.as_view(),
         name='featured_products'),

    path('category/<slug:slug>/',
         views.ProductsByCategoryView.as_view(),
         name='products_by_category'),
]