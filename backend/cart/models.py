from django.db import models
from django.conf import settings
from products.models import Product


class Cart(models.Model):
    """
    One cart per user.
    Created automatically when user adds first item.
    """
    user       = models.OneToOneField(
                    settings.AUTH_USER_MODEL,
                    on_delete=models.CASCADE,
                    related_name='cart'
                 )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'trendio_cart'

    def __str__(self):
        return f"Cart of {self.user.email}"

    @property
    def total_items(self):
        """Total number of individual items in cart."""
        return sum(item.quantity for item in self.items.all())

    @property
    def total_price(self):
        """Total price of all items in cart."""
        return sum(item.subtotal for item in self.items.all())

    @property
    def total_compare_price(self):
        """Total original price (before discounts)."""
        total = 0
        for item in self.items.all():
            if item.product.compare_price:
                total += item.product.compare_price * item.quantity
            else:
                total += item.product.price * item.quantity
        return total

    @property
    def total_discount(self):
        """Total savings."""
        return self.total_compare_price - self.total_price


class CartItem(models.Model):
    """
    Individual item in a cart.
    """
    cart      = models.ForeignKey(
                    Cart,
                    on_delete=models.CASCADE,
                    related_name='items'
                 )
    product   = models.ForeignKey(
                    Product,
                    on_delete=models.CASCADE,
                    related_name='cart_items'
                 )
    quantity  = models.PositiveIntegerField(default=1)
    added_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'trendio_cart_items'
        unique_together = ('cart', 'product')  # No duplicate products in cart

    def __str__(self):
        return f"{self.quantity} x {self.product.name}"

    @property
    def subtotal(self):
        """Price × Quantity for this item."""
        return self.product.price * self.quantity