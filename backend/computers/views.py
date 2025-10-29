# computers/views.py
from rest_framework import viewsets, permissions
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from .models import Computer, Changes
from .serializers import ComputerSerializer, ChangesSerializer
from django.db import models
from django.http import HttpResponse
from rest_framework.permissions import IsAuthenticated, BasePermission
from rest_framework import status
import json
import csv


class IsAuditor(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'auditor'
        )
    
    def has_object_permission(self, request, view, obj):
        return request.method in permissions.SAFE_METHODS


class IsAdministrator(BasePermission):
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and 
            hasattr(request.user, 'profile') and
            request.user.profile.role == 'admin'
        )
    
    def has_object_permission(self, request, view, obj):
        return True


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def import_computers_csv(request):
    if not request.FILES.get('file'):
        return Response({'error': 'Файл не предоставлен'}, status=400)
    
    try:
        file = request.FILES['file']
        decoded_file = file.read().decode('utf-8').splitlines()
        reader = csv.DictReader(decoded_file)
        
        imported_count = 0
        errors = []
        total_rows = 0
        imported_computers = []
        
        for row_num, row in enumerate(reader, 1):
            total_rows += 1
            try:
                # Проверяем, существует ли компьютер с таким именем и IP
                if Computer.objects.filter(computer_name=row['computer_name'], ip_address=row['ip_address']).exists():
                    raise ValueError(f"Компьютер с именем {row['computer_name']} и IP {row['ip_address']} уже существует")
                
                computer = Computer.objects.create(
                    computer_name=row['computer_name'],
                    ip_address=row['ip_address'],
                    location_address=row['location_address'],
                    floor=int(row['floor']),
                    office=row['office'],
                    domain=row.get('domain', ''),
                    pc_owner=row.get('pc_owner', ''),
                    pc_owner_position_at_work=row.get('pc_owner_position_at_work', ''),
                    has_kaspersky=row.get('has_kaspersky', 'false').lower() == 'true',
                    operating_system=row.get('operating_system', ''),
                    comment=row.get('comment', '')
                )
                imported_count += 1
                imported_computers.append({
                    'computer_name': computer.computer_name,
                    'ip_address': computer.ip_address,
                    'location': f"{computer.location_address}, каб. {computer.office}",
                    'os': computer.operating_system,
                    'kaspersky': 'Да' if computer.has_kaspersky else 'Нет',
                    'pc_owner': computer.pc_owner,
                    'position': computer.pc_owner_position_at_work
                })
            except Exception as e:
                errors.append(f"Строка {row_num}: {str(e)}")
        
        if imported_count > 0:
            Changes.objects.create(
                user=request.user,
                computer_name=f"CSV импорт ({imported_count} шт.)",
                computer_ip="N/A",
                change_description={
                    'action': 'csv_import',
                    'imported_count': imported_count,
                    'total_rows': total_rows,
                    'errors': errors,
                    'imported_computers': imported_computers
                }
            )

        response_data = {
            'imported_count': imported_count,
            'total_rows': total_rows,
            'errors': errors,
            'message': f"Импортировано {imported_count} из {total_rows} строк"
        }
        
        return Response(response_data)
    
    except Exception as e:
        return Response({
            'error': str(e),
            'imported_count': 0,
            'total_rows': 0,
            'errors': [str(e)]
        }, status=500)
    

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def log_computer_change(request, computer_id):
    try:
        computer = Computer.objects.get(pk=computer_id)
    except Computer.DoesNotExist:
        return Response({'error': 'Computer not found'}, status=status.HTTP_404_NOT_FOUND)
    
    try:
        change_data = json.loads(request.data.get('change_description', '{}'))
        Changes.objects.create(
            computer=computer,
            user=request.user,
            change_description=change_data
        )
        return Response({'status': 'change logged'}, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    

class ComputerViewSet(viewsets.ModelViewSet):
    queryset = Computer.objects.all()
    serializer_class = ComputerSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            permission_classes = [permissions.IsAuthenticated, IsAuditor|IsAdministrator|permissions.IsAdminUser]
        else:
            permission_classes = [IsAdministrator|permissions.IsAdminUser]
        return [permission() for permission in permission_classes]
    
    @action(detail=True, methods=['get'])
    def changes(self, request, pk=None):
        computer = self.get_object()
        changes = computer.changes.all()
        serializer = ChangesSerializer(changes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def export_csv(self, request):
        # Получаем queryset с учетом фильтров
        queryset = self.filter_queryset(self.get_queryset())
        
        # Создаем HTTP response с заголовком CSV
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="computers_export.csv"'
        
        # Определяем поля для экспорта (добавлены новые поля)
        field_names = [
            'computer_name', 
            'ip_address', 
            'location_address', 
            'floor', 
            'office', 
            'domain',
            'pc_owner',
            'pc_owner_position_at_work',
            'has_kaspersky', 
            'operating_system', 
            'comment'
        ]
        
        writer = csv.DictWriter(response, fieldnames=field_names)
        writer.writeheader()
        
        # Записываем данные
        for computer in queryset:
            writer.writerow({
                'computer_name': computer.computer_name,
                'ip_address': computer.ip_address,
                'location_address': computer.location_address,
                'floor': computer.floor,
                'office': computer.office,
                'domain': computer.domain,
                'pc_owner': computer.pc_owner,
                'pc_owner_position_at_work': computer.pc_owner_position_at_work,
                'has_kaspersky': 'Да' if computer.has_kaspersky else 'Нет',
                'operating_system': computer.operating_system,
                'comment': computer.comment
            })
        
        # Логируем действие
        if request.user.is_authenticated:
            Changes.objects.create(
                user=request.user,
                computer_name="CSV экспорт",
                computer_ip="N/A",
                change_description={
                    'action': 'csv_export',
                    'exported_count': queryset.count()
                }
            )
        
        return response
    

class ChangesViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Changes.objects.select_related('user', 'computer').all()
    serializer_class = ChangesSerializer
    permission_classes = [IsAdministrator|permissions.IsAdminUser, permissions.IsAuthenticated]