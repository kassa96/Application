FROM python:3.12-slim

WORKDIR /app

# Dépendances système minimales
RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

# Installer Poetry
RUN pip install --no-cache-dir poetry

# Désactiver les virtualenvs (IMPORTANT en Docker)
RUN poetry config virtualenvs.create false

# Copier uniquement les fichiers de dépendances (cache Docker)
COPY pyproject.toml poetry.lock* ./

# Installer les dépendances
RUN poetry install --no-root --no-interaction --no-ansi

# Copier le code du backend
COPY . .

EXPOSE 8000

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
