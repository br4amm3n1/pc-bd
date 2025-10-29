from django.db import models
from django.contrib.auth import get_user_model
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings

User = get_user_model()

class Computer(models.Model):
    location_address = models.CharField('Адрес размещения', max_length=255)
    floor = models.PositiveIntegerField('Этаж')
    office = models.CharField('Кабинет', max_length=50)
    computer_name = models.CharField('Имя компьютера', max_length=100)
    pc_owner = models.CharField('Пользователь компьютера', max_length=100, null=True, blank=True)
    pc_owner_position_at_work = models.CharField('Должность пользователя', max_length=100, null=True, blank=True)
    ip_address = models.GenericIPAddressField('IP-адрес', protocol='IPv4')
    domain = models.CharField('Домен', max_length=100)
    has_kaspersky = models.BooleanField('Установлен Касперский', default=False)
    operating_system = models.CharField('Операционная система', max_length=60)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    comment = models.CharField('Комментарий', max_length=255, null=True, blank=True)
    
    def __str__(self):
        return f"{self.computer_name} ({self.ip_address})"
    
    class Meta:
        verbose_name = 'Компьютер'
        verbose_name_plural = 'Компьютеры'
        ordering = ['computer_name']

class Changes(models.Model):
    computer = models.ForeignKey(
        Computer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='changes',
        verbose_name='Компьютер'
    )
    # Новые поля для хранения информации о компьютере
    computer_name = models.CharField('Имя компьютера', max_length=100, blank=True)
    computer_ip = models.GenericIPAddressField('IP-адрес', protocol='IPv4', null=True, blank=True)
    
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        related_name='changes_made',
        verbose_name='Пользователь'
    )
    change_description = models.TextField('Описание изменения')
    change_date = models.DateTimeField('Дата изменения', auto_now_add=True)
    
    def save(self, *args, **kwargs):
        # Автоматически заполняем имя и IP компьютера при сохранении
        if self.computer:
            self.computer_name = self.computer.computer_name
            self.computer_ip = self.computer.ip_address
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"Изменение {self.id} для {self.computer_name or 'Удаленного компьютера'}"
    
    class Meta:
        verbose_name = 'Изменение'
        verbose_name_plural = 'Изменения'
        ordering = ['-change_date']

@receiver(post_save, sender=Changes)
def send_change_notification(sender, instance, created, **kwargs):
    action = "создана" if created else "обновлена"
    subject = f"Учет компьютеров ТНИМЦ. Запись изменений {action}"
    message = (
        f"Запись изменений была {action}:\n\n"
        f"ID: {instance.id}\n"
        f"Компьютер: {instance.computer_name or 'Удаленный компьютер'}\n"
        f"IP: {instance.computer_ip or 'Не указан'}\n"
        f"Пользователь: {instance.user.username if instance.user else 'Не указан'}\n"
        f"Описание: {instance.change_description}\n"
        f"Дата изменения: {instance.change_date}\n"
    )
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [settings.NOTIFICATION_EMAIL],
        fail_silently=False,
    )

@receiver(post_delete, sender=Changes)
def send_delete_notification(sender, instance, **kwargs):
    subject = "Учет компьютеров ТНИМЦ. Запись изменений удалена"
    message = (
        f"Запись изменений была удалена:\n\n"
        f"ID: {instance.id}\n"
        f"Компьютер: {instance.computer_name or 'Удаленный компьютер'}\n"
        f"IP: {instance.computer_ip or 'Не указан'}\n"
        f"Пользователь: {instance.user.username if instance.user else 'Не указан'}\n"
        f"Дата первоначального изменения: {instance.change_date}\n"
    )
    
    send_mail(
        subject,
        message,
        settings.DEFAULT_FROM_EMAIL,
        [settings.NOTIFICATION_EMAIL],
        fail_silently=False,
    )