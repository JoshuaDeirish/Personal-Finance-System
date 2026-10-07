from rest_framework import serializers


class OwnedPrimaryKeyRelatedField(serializers.PrimaryKeyRelatedField):
    """A related field that only resolves objects owned by the requesting user.

    Another user's id behaves exactly like a non-existent id, so ids cannot be
    used to probe for other users' data.
    """

    def get_queryset(self):
        request = self.context.get("request")
        queryset = super().get_queryset()
        if request is None or not request.user.is_authenticated:
            return queryset.none()
        return queryset.filter(user=request.user)


class OwnedModelSerializer(serializers.ModelSerializer):
    """ModelSerializer whose `user` is always the requester, never client input."""

    serializer_related_field = OwnedPrimaryKeyRelatedField
