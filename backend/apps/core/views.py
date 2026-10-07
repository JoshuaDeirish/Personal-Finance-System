from django.db import connection
from rest_framework import viewsets
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response


class OwnerScopedViewSet(viewsets.ModelViewSet):
    """ModelViewSet restricted to the requesting user's rows.

    Objects belonging to other users are simply not in the queryset, so they
    return 404 rather than 403 (no information leak).
    """

    def get_queryset(self):
        return super().get_queryset().filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


@api_view(["GET"])
@authentication_classes([])
@permission_classes([AllowAny])
def health(request):
    """Liveness check for the hosting platform. Verifies the database connection."""
    with connection.cursor() as cursor:
        cursor.execute("SELECT 1")
    return Response({"status": "ok"})
