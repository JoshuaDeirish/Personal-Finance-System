from django.conf import settings
from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OwnedModel(TimeStampedModel):
    """Base for every piece of user financial data.

    Ownership is the foundation of data isolation: viewsets filter on `user`
    and serializers only accept related objects owned by the same user.
    """

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    class Meta:
        abstract = True
