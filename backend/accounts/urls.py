from django.urls import path
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='users')
router.register(r'profiles', views.ProfileViewSet, basename='profiles')

urlpatterns = [
    # path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('delete_token/', views.delete_token, name='delete_token'),
] + router.urls
