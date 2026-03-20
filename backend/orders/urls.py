from django.urls import path
from . import views

urlpatterns = [
    # Customer URLs
    path('',
         views.OrderListView.as_view(),
         name='order_list'),

    path('place/',
         views.PlaceOrderView.as_view(),
         name='place_order'),

    path('<str:order_number>/',
         views.OrderDetailView.as_view(),
         name='order_detail'),

    path('<str:order_number>/cancel/',
         views.CancelOrderView.as_view(),
         name='cancel_order'),

    # Admin URLs
    path('admin/all/',
         views.AdminOrderListView.as_view(),
         name='admin_order_list'),

    path('admin/<str:order_number>/status/',
         views.AdminUpdateOrderStatusView.as_view(),
         name='admin_update_status'),
]