from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.cache import cache
from .models import Changes

@receiver([post_save, post_delete], sender=Changes)
def invalidate_changes_cache(sender, instance, **kwargs):
    """Инвалидируем кэш версии при любом изменении в таблице Changes"""
    cache.delete('changes_etag')
    cache.delete('changes_version')