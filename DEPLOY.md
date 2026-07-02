# Deployment & Development Guide

This guide explains how to deploy the Django backend to Render, how to run it locally, and how to test the Docker build.

## Render Deployment

We use a single `Dockerfile` optimized for Render. The frontend is deployed as a separate Static Site, and Postgres/Redis are managed services on Render.

### 1. Web Service
- **Build Command**: (Handled by Dockerfile)
- **Start Command**: `gunicorn core.wsgi:application --bind 0.0.0.0:${PORT:-8000} --workers 3` (This is the default `CMD` in the Dockerfile).
- **Environment Variables**:
  - `DATABASE_URL`: Set to your internal Render Postgres URL.
  - `CELERY_BROKER_URL`: Set to your internal Render Redis URL.
  - `SECRET_KEY`, `ALLOWED_HOSTS`, etc.

The default `entrypoint.sh` will automatically:
- Wait for Postgres to be ready
- Run `python manage.py migrate`
- Run `seed_staff` and `seed_data` (non-fatal)

### 2. Background Worker (Celery)
To run background tasks on Render, create a **Background Worker** service using the same repository and Dockerfile.

- **Start Command Override**: `celery -A core worker -l info`
- **Important Configuration**:
  By default, the `entrypoint.sh` runs migrations and seeds. To prevent the worker from running these concurrently with the Web Service, you should bypass the entrypoint or ensure the web service completes migrations first.
  - In your Render Background Worker dashboard, set the **Docker Command** to override the default CMD: `celery -A core worker -l info`
  - Ideally, set the **Docker Entrypoint** in the Render dashboard to something like `/bin/bash` or `sh` to skip the migrations in `entrypoint.sh`.

## Local Development (Without Docker)

You can run the backend natively on your machine for daily development.

```bash
# 1. Activate your virtualenv
source env/bin/activate   # Linux/Mac
.\env\Scripts\activate    # Windows

# 2. Make sure you have a local Postgres and Redis running, or use local DB settings in your .env
# Your existing .env file is automatically loaded.

# 3. Start the dev server
python manage.py runserver
```

## Testing the Docker Build Locally

Before pushing to Render, you can verify that the Docker image builds successfully and the container runs properly using your local `.env`.

```bash
# 1. Build the image
docker build -t backend .

# 2. Run the container using your local .env file
docker run -p 8000:8000 --env-file .env backend
```
*(Note: Ensure your `.env` contains valid connection strings for any external dependencies if you are testing them from within the container.)*
