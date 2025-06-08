#!/bin/bash

# End-to-end installation script for Debian 12
# Installs all dependencies, clones the repository and configures the system

set -e

# ---- Configuration ----
APP_USER=${APP_USER:-accounting}
APP_DIR=${APP_DIR:-/opt/accounting-system}
REPO_URL=${REPO_URL:-https://github.com/naturae-syria/Accounting.git}

DB_USER=${DB_USER:-accounting}
DB_NAME=${DB_NAME:-accounting_db}
DB_PASSWORD=${DB_PASSWORD:-$(openssl rand -hex 16)}
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}

# ---- System Packages ----
echo "Updating system packages..."
sudo apt-get update && sudo apt-get upgrade -y

echo "Installing required packages..."
sudo apt-get install -y git curl nginx postgresql postgresql-contrib

echo "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "Installing PM2 and pnpm..."
sudo npm install -g pm2 pnpm

# ---- Application User ----
if id "$APP_USER" &>/dev/null; then
  echo "User $APP_USER already exists"
else
  echo "Creating system user $APP_USER..."
  sudo adduser --system --group --home "$APP_DIR" "$APP_USER"
fi

# ---- Clone Repository ----
if [ -d "$APP_DIR/.git" ]; then
  echo "Updating existing repository..."
  sudo -u "$APP_USER" git -C "$APP_DIR" pull
else
  echo "Cloning repository..."
  sudo mkdir -p "$APP_DIR"
  sudo chown "$APP_USER":"$APP_USER" "$APP_DIR"
  sudo -u "$APP_USER" git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"

# ---- Run Setup ----
export DB_USER DB_NAME DB_PASSWORD DB_HOST DB_PORT
sudo -E bash setup-all.sh

echo "Installation complete."
echo "Database user: $DB_USER"
echo "Database name: $DB_NAME"
echo "Database password: $DB_PASSWORD"
