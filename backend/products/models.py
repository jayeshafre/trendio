from django.db import models
from django.utils.text import slugify


class Category(models.Model):
    """
    Product categories.
    Example: Men, Women, Kids, Electronics
    """
    name        = models.CharField(max_length=200, unique=True)
    slug        = models.SlugField(max_length=200, unique=True, blank=True)
    description = models.TextField(blank=True)
    image       = models.ImageField(
                    upload_to='categories/',
                    blank=True,
                    null=True
                  )
    is_active   = models.BooleanField(default=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table        = 'trendio_categories'
        verbose_name    = 'Category'
        verbose_name_plural = 'Categories'
        ordering        = ['name']

    def save(self, *args, **kwargs):
        # Auto generate slug from name
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Product(models.Model):
    """
    Main product model for Trendio.
    """
    category      = models.ForeignKey(
                        Category,
                        on_delete=models.SET_NULL,
                        null=True,
                        blank=True,
                        related_name='products'
                    )
    name          = models.CharField(max_length=300)
    slug          = models.SlugField(max_length=300, unique=True, blank=True)
    description   = models.TextField(blank=True)
    price         = models.DecimalField(max_digits=10, decimal_places=2)
    compare_price = models.DecimalField(
                        max_digits=10,
                        decimal_places=2,
                        null=True,
                        blank=True,
                        help_text="Original price before discount"
                    )
    image         = models.ImageField(
                        upload_to='products/',
                        blank=True,
                        null=True
                    )
    stock         = models.PositiveIntegerField(default=0)
    sku           = models.CharField(
                        max_length=100,
                        unique=True,
                        blank=True,
                        null=True
                    )
    is_active     = models.BooleanField(default=True)
    is_featured   = models.BooleanField(default=False)
    created_at    = models.DateTimeField(auto_now_add=True)
    updated_at    = models.DateTimeField(auto_now=True)

    class Meta:
        db_table  = 'trendio_products'
        ordering  = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

    @property
    def discount_percentage(self):
        """Calculate discount percentage if compare_price exists."""
        if self.compare_price and self.compare_price > self.price:
            discount = ((self.compare_price - self.price) / self.compare_price) * 100
            return round(discount)
        return 0

    @property
    def is_in_stock(self):
        return self.stock > 0