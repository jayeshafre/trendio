from django.db import models
from django.conf import settings
from products.models import Product
import random
import string
from django.utils import timezone


def generate_order_number():
    """
    Generate unique order number.
    Format: TRD-YYYYMMDD-XXXXX
    Example: TRD-20240101-A3F7K
    """
    date_str   = timezone.now().strftime('%Y%m%d')
    random_str = ''.join(random.choices(string.ascii_uppercase + string.digits, k=5))
    return f"TRD-{date_str}-{random_str}"


class Order(models.Model):
    """
    Main order model — represents a completed purchase.
    """

    class Status(models.TextChoices):
        PENDING    = 'pending',    'Pending'
        CONFIRMED  = 'confirmed',  'Confirmed'
        PROCESSING = 'processing', 'Processing'
        SHIPPED    = 'shipped',    'Shipped'
        DELIVERED  = 'delivered',  'Delivered'
        CANCELLED  = 'cancelled',  'Cancelled'

    # ─── Core Fields ──────────────────────────────────────────
    user         = models.ForeignKey(
                    settings.AUTH_USER_MODEL,
                    on_delete=models.CASCADE,
                    related_name='orders'
                   )
    order_number  = models.CharField(
                    max_length=50,
                    unique=True,
                    default=generate_order_number
                   )
    status        = models.CharField(
                    max_length=20,
                    choices=Status.choices,
                    default=Status.PENDING
                   )

    # ─── Amount Fields ────────────────────────────────────────
    total_amount    = models.DecimalField(max_digits=10, decimal_places=2)
    delivery_charge = models.DecimalField(
                        max_digits=6,
                        decimal_places=2,
                        default=0
                      )

    # ─── Delivery Address ─────────────────────────────────────
    full_name     = models.CharField(max_length=200)
    phone         = models.CharField(max_length=15)
    address_line1 = models.CharField(max_length=300)
    address_line2 = models.CharField(max_length=300, blank=True)
    city          = models.CharField(max_length=100)
    state         = models.CharField(max_length=100)
    pincode       = models.CharField(max_length=10)
    notes         = models.TextField(blank=True)

    # ─── Timestamps ───────────────────────────────────────────
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trendio_orders'
        ordering = ['-created_at']

    def __str__(self):
        return f"Order {self.order_number} by {self.user.email}"

    @property
    def grand_total(self):
        """Total including delivery charge."""
        return self.total_amount + self.delivery_charge

    @property
    def can_cancel(self):
        """Order can only be cancelled if still pending or confirmed."""
        return self.status in [self.Status.PENDING, self.Status.CONFIRMED]

    @property
    def status_display_info(self):
        """Returns icon and color for each status."""
        info = {
            'pending':    {'icon': '⏳', 'color': 'yellow'},
            'confirmed':  {'icon': '✅', 'color': 'blue'},
            'processing': {'icon': '⚙️', 'color': 'purple'},
            'shipped':    {'icon': '🚚', 'color': 'orange'},
            'delivered':  {'icon': '🎉', 'color': 'green'},
            'cancelled':  {'icon': '❌', 'color': 'red'},
        }
        return info.get(self.status, {'icon': '📦', 'color': 'gray'})


class OrderItem(models.Model):
    """
    Individual items within an order.
    Prices are snapshotted at time of purchase.
    """
    order         = models.ForeignKey(
                        Order,
                        on_delete=models.CASCADE,
                        related_name='items'
                    )
    product       = models.ForeignKey(
                        Product,
                        on_delete=models.SET_NULL,
                        null=True,
                        related_name='order_items'
                    )
    # Snapshots at time of purchase
    product_name  = models.CharField(max_length=300)
    product_image = models.CharField(max_length=500, blank=True)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    quantity      = models.PositiveIntegerField()
    subtotal      = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        db_table = 'trendio_order_items'

    def __str__(self):
        return f"{self.quantity} x {self.product_name}"