from rest_framework import serializers

class UpdatedBySerializerMixin(serializers.Serializer):
    updated_by = serializers.SerializerMethodField()

    def get_updated_by(self, obj):
        if obj.updated_by:
            return f"{obj.updated_by.first_name} {obj.updated_by.last_name}: {obj.updated_by.email}"
        return None

class NullableDateField(serializers.DateField):
    def to_internal_value(self, value):
        if value in ("", None):
            return None
        return super().to_internal_value(value)

    def validate_empty_values(self, data):
        if data == "":
            data = None
        return super().validate_empty_values(data)