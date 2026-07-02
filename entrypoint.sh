#!/bin/bash
set -e

# ── Wait for Postgres ──────────────────────────────────────
echo "Waiting for PostgreSQL at ${DB_HOST:-localhost}:${DB_PORT:-5432}..."
until pg_isready -h "${DB_HOST:-localhost}" -p "${DB_PORT:-5432}" -U "${DB_USER:-biu_drf}" -q; do
  echo "   Postgres not ready — retrying in 2s..."
  sleep 2
done
echo "PostgreSQL is ready."

# ── Run migrations ──────────────────────────────────────────
python manage.py migrate --noinput

# ── Seed data (idempotent, non-fatal) ──────────────────────
python manage.py seed_staff || echo "⚠ seed_staff skipped or failed (non-fatal)"
python manage.py seed_data  || echo "⚠ seed_data skipped or failed (non-fatal)"

# ── Execute CMD (gunicorn in prod, runserver in dev) ───────
exec "$@"
