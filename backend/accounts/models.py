from django.db import models
from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings


class Profile(models.Model):
    ROLE_CHOICES = [
        ('employee', 'Работник'),
        ('admin', 'Администратор'),
        ('auditor', 'Аудитор')
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='employee')
    position = models.CharField(max_length=100, blank=True, null=True)
    department = models.CharField(max_length=100, blank=True, null=True)
    registration_date = models.DateTimeField(auto_now_add=True)

    def str(self):
        return f"Профиль {self.user.username}"

class ExpiringToken(Token):
    expires_at = models.DateTimeField()

    @property
    def is_expired(self):
        return timezone.now() >= self.expires_at

    def save(self, *args, **kwargs):
        if not self.expires_at:
            self.expires_at = timezone.now() + timezone.timedelta(seconds=settings.TOKEN_EXPIRE_TIME)
        return super().save(*args, **kwargs)
    
@receiver(post_save, sender=User)
def create_auth_token(sender, instance=None, created=False, **kwargs):
    """Автоматически создает токен при создании пользователя"""
    if created:
        ExpiringToken.objects.create(user=instance)

@receiver(post_save, sender=User)
def create_user_profile(sender, instance, created, **kwargs):
    if created:
        Profile.objects.create(user=instance)

@receiver(post_save, sender=User)
def save_user_profile(sender, instance, **kwargs):
    instance.profile.save()
