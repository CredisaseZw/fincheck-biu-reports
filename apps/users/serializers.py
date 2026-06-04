from apps.users.models import User
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'full_name',
            'email',
            'is_active'
        ]

    def get_full_name(self, instance: User) -> str:
        return instance.get_full_name()
    
class UserSignInSerializers(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(required=True)

    def validate(self, data):
        email = data.get("email")
        password = data.get("password")

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            raise serializers.ValidationError({"error": "Invalid email or password"})

        if not user.check_password(password):
            raise serializers.ValidationError({"error": "Invalid email or password"})

        if not user.is_active:
            raise serializers.ValidationError({"error": "Account is locked. Contact support."})

        token = RefreshToken.for_user(user)
        return {
            "user": user,
            "token": {
                "access": str(token.access_token),
                "refresh": str(token),
            }
        }    


class CreateUserSerializer(serializers.Serializer):
    first_name = serializers.CharField(required=True)
    last_name = serializers.CharField(required=True)
    email = serializers.CharField(required=True)
    password = serializers.CharField(required=True)
