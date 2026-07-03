from rest_framework import serializers

class UpdatedBySerializerMixin(serializers.Serializer):
    updated_by = serializers.SerializerMethodField()

    def get_updated_by(self, obj):
        if obj.updated_by:
            return f"{obj.updated_by.first_name} {obj.updated_by.last_name}: {obj.updated_by.email}"
        return None