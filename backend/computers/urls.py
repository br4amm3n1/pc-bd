from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ComputerViewSet, log_computer_change, 
    ChangesViewSet, import_computers_csv
)

router = DefaultRouter()
router.register(r'computers', ComputerViewSet, basename='computer')
router.register(r'changes', ChangesViewSet, basename='changes')

urlpatterns = [
    path('computers/<int:computer_id>/log_change/', log_computer_change, name='log-computer-change'),
    path('computers/import_csv/', import_computers_csv, name='import-computers-csv'),
] + router.urls