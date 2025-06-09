#!/bin/bash
set -e

# Repository information
GITHUB_USERNAME=${GITHUB_USERNAME:-naturae-syria}
GITHUB_REPO=${GITHUB_REPO:-Accounting}
BRANCH=${BRANCH:-docker}
REPO_URL=${REPO_URL:-"https://github.com/${GITHUB_USERNAME}/${GITHUB_REPO}.git"}

# Local directory to clone the repo
APP_DIR=${APP_DIR:-$HOME/accounting-docker}

echo "Installing Accounting application from branch '$BRANCH' using Docker..."

# Ensure Docker is installed
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker not found. Installing Docker..."
  curl -fsSL https://get.docker.com | sudo sh
fi

# Ensure docker compose is available (either docker-compose or docker compose plugin)
if ! docker compose version >/dev/null 2>&1; then
  echo "docker compose plugin not found. Installing..."
  sudo apt-get update
  sudo apt-get install -y docker-compose-plugin
fi

# Clone repository if not already present
if [ -d "$APP_DIR/.git" ]; then
  echo "Repository exists. Updating..."
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout "$BRANCH"
  git -C "$APP_DIR" pull origin "$BRANCH"
else
  echo "Cloning repository..."
  git clone --branch "$BRANCH" "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# Prepare environment file
if [ -f .env.example ] && [ ! -f .env ]; then
  cp .env.example .env
fi

# Make helper scripts executable
chmod +x run-docker.sh init-db.sh

# Build and start containers
echo "Building Docker images..."
docker compose build

echo "Starting application using Docker..."
./run-docker.sh

echo "\nApplication setup complete. Access it via http://localhost:3000"
