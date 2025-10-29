from rest_framework import viewsets, permissions, generics, status
from rest_framework.exceptions import PermissionDenied
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from .models import Profile, ExpiringToken
from rest_framework.authtoken.models import Token
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.decorators import action, api_view
from .serializers import (
    UserSerializer, ProfileSerializer, 
    UserRegisterSerializer, LoginSerializer
)

# class RegisterView(generics.CreateAPIView):
#     queryset = User.objects.all()
#     serializer_class = UserRegisterSerializer
#     permission_classes = [permissions.AllowAny]

#     def post(self, request, *args, **kwargs):
#         serializer = self.get_serializer(data=request.data)
#         serializer.is_valid(raise_exception=True)
#         user = serializer.save()
#         token, created = Token.objects.get_or_create(user=user)
#         return Response({
#             'user': serializer.data,
#             'token': token.key
#         }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
def delete_token(request):
    if not request.user.is_authenticated:
        return Response({
            'message': 'User is not authenticated'
        }, status=status.HTTP_401_UNAUTHORIZED)
    
    deleted_count, _ = ExpiringToken.objects.filter(user=request.user).delete()
    
    if deleted_count == 0:
        return Response({
            'message': 'No active tokens found for this user'
        }, status=status.HTTP_404_NOT_FOUND)
        
    return Response({
        'message': f'Successfully deleted {deleted_count} token(s)'
    }, status=status.HTTP_200_OK)
    
    
class LoginView(APIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = authenticate(
                username=serializer.validated_data['username'],
                password=serializer.validated_data['password']
            )
            if user is not None:
                ExpiringToken.objects.filter(user=user).delete()
                
                token = ExpiringToken.objects.create(user=user)
                
                return Response({
                    'token': token.key,
                    'user_id': user.id,
                    'expires_at': token.expires_at
                })
            else:
                return Response(
                    {'error': 'Invalid credentials'}, 
                    status=status.HTTP_401_UNAUTHORIZED
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return User.objects.all()
        return User.objects.filter(id=self.request.user.id)
    
    def perform_update(self, serializer):
        if self.request.user.is_superuser or serializer.instance == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("Вы можете редактировать только собственные данные.")
        
    @action(detail=False, methods=['GET'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)


class ProfileViewSet(viewsets.ModelViewSet):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.is_superuser:
            return Profile.objects.all()
        return Profile.objects.filter(user=self.request.user)
    
    def perform_update(self, serializer):
        if self.request.user.is_superuser or serializer.instance.user == self.request.user:
            serializer.save()
        else:
            raise PermissionDenied("Вы можете редактировать только собственный профиль.")
        
    @action(detail=False, methods=['GET'])
    def me(self, request):
        profile = request.user.profile
        serializer = self.get_serializer(profile)
        return Response(serializer.data)
