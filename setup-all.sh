#!/bin/bash

# Variable configuration
APP_NAME="accounting-system"
GITHUB_USERNAME="naturae-syria"
GITHUB_REPO="Accounting"
# Optional domain name. Defaults to localhost and can be changed later
DOMAIN=${DOMAIN:-localhost}
USE_SSL=${USE_SSL:-false}

# Allow providing a custom domain when running the script
read -p "Enter domain name (default: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}

# Check prerequisites
echo "Checking prerequisites..."
for cmd in git node pnpm; do
    if ! command -v $cmd &> /dev/null; then
        echo "$cmd is not installed. Installing..."
        sudo apt-get update
        sudo apt-get install -y $cmd
    fi
done

# Set up the database
echo "Setting up the database..."
bash ./setup-db.sh

# Set up Redis
echo "Setting up Redis..."
bash ./setup-redis.sh

# Clone the repository
echo "Cloning repository..."
APP_DIR="/var/www/$APP_NAME"
sudo mkdir -p "$APP_DIR"
sudo chown $(whoami):$(whoami) "$APP_DIR"
if [ -d "$APP_DIR/.git" ]; then
    echo "Directory exists. Updating repository..."
    git -C "$APP_DIR" pull
else
    git clone https://github.com/$GITHUB_USERNAME/$GITHUB_REPO.git "$APP_DIR"
fi
cd "$APP_DIR"

# Install dependencies
echo "Installing dependencies..."
rm -rf node_modules
pnpm install --force

# Create .env file
echo "Creating .env file..."
if [ -f .env.example ]; then
    cp .env.example .env
else
    cat > .env <<EOF_ENV
DB_USER=$DB_USER
DB_HOST=$DB_HOST
DB_NAME=$DB_NAME
DB_PASSWORD=$DB_PASSWORD
DB_PORT=$DB_PORT
EOF_ENV
fi

# Update .env with database settings
sed -i "s/DB_USER=.*/DB_USER=$DB_USER/" .env
sed -i "s/DB_HOST=.*/DB_HOST=$DB_HOST/" .env
sed -i "s/DB_NAME=.*/DB_NAME=$DB_NAME/" .env
sed -i "s/DB_PASSWORD=.*/DB_PASSWORD=$DB_PASSWORD/" .env
sed -i "s/DB_PORT=.*/DB_PORT=$DB_PORT/" .env

# Build the application
echo "Building the application..."
pnpm run build

# Configure PM2
echo "Configuring PM2..."
bash ./setup-pm2.sh

# Configure Nginx
echo "Configuring Nginx..."
USE_SSL=$USE_SSL DOMAIN=$DOMAIN ./setup-nginx.sh

# Configure backups
echo "Configuring backups..."
sudo cp backup-db.sh /usr/local/bin/
sudo chmod +x /usr/local/bin/backup-db.sh
# إضافة مهمة cron لتشغيل النسخ الاحتياطي يوميًا في الساعة 2 صباحًا
(crontab -l 2>/dev/null; echo "0 2 * * * /usr/local/bin/backup-db.sh") | crontab -

# Configure Fail2Ban
echo "Configuring Fail2Ban..."
bash ./setup-fail2ban.sh

# Configure monitoring
echo "Configuring monitoring..."
bash ./setup-monitoring.sh

# Final message
echo "System setup complete!"
echo "You can access the application at: http://$DOMAIN"
if [ "$USE_SSL" = "true" ]; then
    echo "Or: https://$DOMAIN"
fi
