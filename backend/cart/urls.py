from django.urls import path
from . import views

urlpatterns = [
    # View cart
    path('',
         views.CartView.as_view(),
         name='cart'),

    # Cart count for navbar
    path('count/',
         views.CartCountView.as_view(),
         name='cart_count'),

    # Add to cart
    path('add/',
         views.AddToCartView.as_view(),
         name='add_to_cart'),

    # Update item quantity
    path('update/<int:item_id>/',
         views.UpdateCartItemView.as_view(),
         name='update_cart_item'),

    # Remove single item
    path('remove/<int:item_id>/',
         views.RemoveCartItemView.as_view(),
         name='remove_cart_item'),

    # Clear entire cart
    path('clear/',
         views.ClearCartView.as_view(),
         name='clear_cart'),
]