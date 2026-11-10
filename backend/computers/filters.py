import django_filters
from .models import Computer


class ComputerFilter(django_filters.FilterSet):
    """
    Повторяет семантику useFilters на клиенте:
    - все строковые поля — icontains (подстрока, без учёта регистра)
    - floor — icontains по строковому представлению (как на клиенте!)
    - has_kaspersky — точное сравнение true/false
    """

    computer_name = django_filters.CharFilter(lookup_expr='icontains')
    ip_address = django_filters.CharFilter(lookup_expr='icontains')
    mac_address = django_filters.CharFilter(lookup_expr='icontains')
    location_address = django_filters.CharFilter(lookup_expr='icontains')
    office = django_filters.CharFilter(lookup_expr='icontains')
    domain = django_filters.CharFilter(lookup_expr='icontains')
    pc_owner = django_filters.CharFilter(lookup_expr='icontains')
    pc_owner_position_at_work = django_filters.CharFilter(lookup_expr='icontains')
    operating_system = django_filters.CharFilter(lookup_expr='icontains')
    comment = django_filters.CharFilter(lookup_expr='icontains')

    institute_name = django_filters.CharFilter(method='filter_institute')
    
    floor = django_filters.CharFilter(method='filter_floor_contains')

    has_kaspersky = django_filters.CharFilter(method='filter_kaspersky')

    def filter_institute(self, queryset, name, value):
        qs = queryset.filter(institute_name__iexact=value)
        if qs.exists():
            return qs
        model_field = Computer._meta.get_field('institute_name')
        codes = [code for code, display in model_field.choices
                if str(display).lower() == value.lower()]
        if codes:
            return queryset.filter(institute_name__in=codes)
        return queryset.none()

    def filter_floor_contains(self, queryset, name, value):
        from django.db.models.functions import Cast
        from django.db.models import CharField
        return queryset.annotate(
            _floor_str=Cast('floor', output_field=CharField())
        ).filter(_floor_str__icontains=value)

    def filter_kaspersky(self, queryset, name, value):
        lowered = str(value).strip().lower()
        if lowered in ('true', '1'):
            return queryset.filter(has_kaspersky=True)
        if lowered in ('false', '0'):
            return queryset.filter(has_kaspersky=False)
        return queryset

    class Meta:
        model = Computer
        fields = [
            'computer_name', 'ip_address', 'mac_address',
            'institute_name', 'location_address', 'floor', 'office',
            'domain', 'pc_owner', 'pc_owner_position_at_work',
            'has_kaspersky', 'operating_system', 'comment',
        ]