from django.urls import path
from . import views

urlpatterns = [
    path('create/',
         views.CreatePaymentView.as_view(),
         name='create_payment'),

    path('verify/',
         views.VerifyPaymentView.as_view(),
         name='verify_payment'),

    path('failed/',
         views.PaymentFailedView.as_view(),
         name='payment_failed'),

    path('status/<str:order_number>/',
         views.PaymentStatusView.as_view(),
         name='payment_status'),
]