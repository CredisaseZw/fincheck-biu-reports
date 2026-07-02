# Docker Development Guide

Run the entire Fincheck stack (Django API, Celery worker, PostgreSQL, Redis, Vite frontend) with a single command.

## Quick Start

```bash
# 1. Create your Docker env file from the example template
cp .env.docker.example .env.docker

# 2. (Optional) Edit .env.docker to change passwords, secret key, etc.

# 3. Build and start all services
docker compose up --build
```

Once running:
- **Backend API**: [http://localhost:8000](http://localhost:8000)
- **Django Admin**: [http://localhost:8000/admin/](http://localhost:8000/admin/)
- **Frontend**: [http://localhost:5173](http://localhost:5173)

On first startup the backend container will:
1. Wait for PostgreSQL to be ready
2. Run `python manage.py migrate`
3. Run `seed_staff` and `seed_data` (skips if data already exists)
4. Start the Django dev server

## Services

| Service    | Image / Build       | Port  | Purpose                               |
|------------|---------------------|-------|---------------------------------------|
| `db`       | postgres:16-alpine  | 5432  | PostgreSQL database (persistent volume) |
| `redis`    | redis:7-alpine      | 6379  | Celery broker + Django cache          |
| `backend`  | Built from `./Dockerfile` | 8000  | Django API (runserver for dev)   |
| `celery`   | Same image as backend | —   | Celery worker for async tasks         |
| `frontend` | Built from `./frontend/Dockerfile` | 5173 | Vite + React dev server  |

## Hot Reload

Both backend and frontend support hot reload in Docker:

- **Backend**: Uses `python manage.py runserver` (not gunicorn) in the compose config. The project directory is bind-mounted into the container, so editing Python files on your host triggers an automatic reload.
- **Frontend**: Uses Vite's HMR. The `frontend/` directory is bind-mounted, so editing React/TS files updates the browser instantly.

## Useful Commands

```bash
# Start in detached mode
docker compose up -d --build

# View logs for a specific service
docker compose logs -f backend

# Run a Django management command
docker compose exec backend python manage.py createsuperuser

# Stop all services
docker compose down

# Stop and remove volumes (database data will be lost)
docker compose down -v

# Rebuild a single service
docker compose build backend
```

## Local Development (Without Docker)

You can still run the backend and frontend natively on your machine — the Docker setup doesn't interfere with local dev.

### Backend

```bash
# Activate your virtualenv
source env/bin/activate   # Linux/Mac
.\env\Scripts\activate    # Windows

# Your existing .env file (DB_HOST=localhost, etc.) is loaded by python-dotenv
python manage.py runserver
```

### Frontend

```bash
cd frontend
pnpm dev
```

The `settings.py` defaults are designed to work locally without any Docker env vars:
- Database: reads `DB_HOST`, `DB_NAME`, etc. from your local `.env`
- Redis/Celery: defaults to `redis://localhost:6379/0`
- `ALLOWED_HOSTS`: always includes `localhost` and `127.0.0.1`

## Production / Render Deployment

When deployed without Docker Compose (e.g., on Render), the Dockerfile's built-in `CMD` is used:

```
gunicorn core.wsgi:application --bind 0.0.0.0:8000 --workers 3
```

The `entrypoint.sh` still runs migrations and seeds before starting gunicorn. Static files are collected during the Docker build stage (`collectstatic`).

Set your production environment variables (`SECRET_KEY`, `DATABASE_URL`, `ALLOWED_HOSTS`, etc.) via the hosting platform's config.
