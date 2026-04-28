# LMS for Students

Система управления обучением (LMS) для студентов и преподавателей. Студенты ведут журнал занятий, прикрепляют файлы через Яндекс Диск, а преподаватели просматривают записи и выставляют оценки.

## Стек

- **Backend:** Django 6, Django REST Framework, Djoser, JWT-аутентификация
- **Frontend:** React + Vite
- **База данных:** PostgreSQL 15
- **Файлы:** Яндекс Диск API
- **Деплой:** Docker Compose, Nginx, GitHub Actions

## Роли пользователей

| Роль | Возможности |
|------|-------------|
| **Студент** | Создаёт и редактирует свои записи о занятиях, прикрепляет файлы |
| **Преподаватель** | Видит все записи всех студентов, выставляет оценки, управляет группами |

## Быстрый старт

### Локально (без Docker)

1. Клонируйте репозиторий и создайте `.env` на основе примера:

```env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

DB_ENGINE=django.db.backends.postgresql
DB_NAME=lms
DB_USER=lms_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_PORT=5432

DISK_TOKEN=your_yandex_disk_oauth_token
```

2. Установите зависимости и запустите:

```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### С Docker Compose

```bash
cd infra
docker-compose up -d
docker-compose exec backend python manage.py migrate
docker-compose exec backend python manage.py createsuperuser
```

Приложение будет доступно на `http://localhost`.

## API

Базовый URL: `/api/`

| Эндпоинт | Методы | Описание |
|----------|--------|----------|
| `/api/groups/` | GET, POST, PATCH, DELETE | Группы студентов |
| `/api/users/` | GET, POST | Пользователи (Djoser) |
| `/api/entries/` | GET, POST, PATCH, DELETE | Записи о занятиях |
| `/api/entries/{id}/grade/` | PATCH | Выставить оценку (только преподаватель) |
| `/api/auth/token/login/` | POST | Получить токен |
| `/api/auth/token/logout/` | POST | Выйти |

### Фильтрация и сортировка записей

```
GET /api/entries/?student=5&date=2024-09-01
GET /api/entries/?ordering=-grade
GET /api/entries/?search=проект
```

## Тесты

```bash
pytest -v
```

## CI/CD

GitHub Actions автоматически при пуше в `main`:
1. Запускает тесты (`pytest`)
2. Собирает и пушит Docker-образ на Docker Hub
3. Деплоит на сервер через SSH

Необходимые секреты в репозитории: `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `SERVER_HOST`, `SERVER_USER`, `SSH_KEY`.
