from rest_framework import serializers
from .models import Computer, Changes
from accounts.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name')


class ComputerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Computer
        fields = '__all__'


class ChangesSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    computer = ComputerSerializer(read_only=True)
    
    class Meta:
        model = Changes
        fields = '__all__'
        read_only_fields = ('user', 'computer', 'change_date')

# class ComputerWithChangesSerializer(serializers.ModelSerializer):
#     changes = ChangesSerializer(many=True, read_only=True)
    
#     class Meta:
#         model = Computer
#         fields = '__all__'