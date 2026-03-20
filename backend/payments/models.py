from django.db import models
from orders.models import Order


class Payment(models.Model):
    """
    Stores payment details for every transaction.
    """

    class Status(models.TextChoices):
        PENDING = 'pending', 'Pending'
        SUCCESS = 'success', 'Success'
        FAILED  = 'failed',  'Failed'
        REFUNDED = 'refunded', 'Refunded'

    order                = models.OneToOneField(
                            Order,
                            on_delete=models.CASCADE,
                            related_name='payment'
                           )
    razorpay_order_id    = models.CharField(max_length=100, unique=True)
    razorpay_payment_id  = models.CharField(max_length=100, blank=True)
    razorpay_signature   = models.CharField(max_length=200, blank=True)
    amount               = models.DecimalField(max_digits=10, decimal_places=2)
    currency             = models.CharField(max_length=10, default='INR')
    status               = models.CharField(
                            max_length=20,
                            choices=Status.choices,
                            default=Status.PENDING
                           )
    created_at           = models.DateTimeField(auto_now_add=True)
    updated_at           = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trendio_payments'

    def __str__(self):
        return f"Payment for {self.order.order_number} — {self.status}"