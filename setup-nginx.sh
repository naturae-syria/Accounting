#!/bin/bash

# Variable configuration
APP_NAME="accounting-system"
# Optional domain name. Defaults to localhost and can be changed later
DOMAIN=${DOMAIN:-localhost}
USE_SSL=${USE_SSL:-false}

# Allow providing a custom domain when running the script
read -p "Enter domain name (default: $DOMAIN): " DOMAIN_INPUT
DOMAIN=${DOMAIN_INPUT:-$DOMAIN}

# Ensure Nginx is installed
if ! command -v nginx &> /dev/null; then
    echo "Nginx is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y nginx
fi

# Create Nginx configuration file
echo "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/$APP_NAME > /dev/null << EOL
server {
    listen 80;
    server_name $DOMAIN;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Gzip compression
    gzip on;
    gzip_comp_level 5;
    gzip_min_length 256;
    gzip_proxied any;
    gzip_vary on;
    gzip_types
      application/javascript
      application/json
      application/x-javascript
      text/css
      text/javascript
      text/plain
      text/xml;
    
    # Cache static files
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
EOL

# Enable Nginx site
sudo ln -sf /etc/nginx/sites-available/$APP_NAME /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx

# Configure SSL if requested
if [ "$USE_SSL" = "true" ]; then
    echo "Configuring SSL with Let's Encrypt..."
    
    # Ensure Certbot is installed
    if ! command -v certbot &> /dev/null; then
        echo "Certbot is not installed. Installing..."
        sudo apt-get update
        sudo apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtain SSL certificate
    sudo certbot --nginx -d $DOMAIN
fi

echo "Nginx setup complete!"
