FROM python:3.11-slim

# Установка зависимостей
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем зависимости
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем Django-проект
COPY backend /app

# Копируем сборку React
COPY frontend/build /app/frontend_build

# Создаем правильную структуру для статики
RUN mkdir -p /app/staticfiles && \
    mkdir -p /app/frontend_build/static

# Собираем статику
RUN python manage.py collectstatic --noinput

EXPOSE 8000

CMD ["gunicorn", "--bind", "0.0.0.0:8000", "--workers", "1", "info_pcs.wsgi:application"]
