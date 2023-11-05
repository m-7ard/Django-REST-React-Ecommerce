from django.db import models


class Category(models.Model):
    parent = models.ForeignKey('self', on_delete=models.CASCADE, related_name='subcategories', null=True, blank=True)
    name = models.CharField(max_length=30)

    def __str__(self):
        if self.parent:
            return f'{self.parent.__str__()} > {self.name}'
        else:
            return self.name