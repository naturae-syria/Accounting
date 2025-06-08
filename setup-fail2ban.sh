#!/bin/bash

# Ensure Fail2Ban is installed
if ! command -v fail2ban-server &> /dev/null; then
    echo "Fail2Ban is not installed. Installing..."
    sudo apt-get update
    sudo apt-get install -y fail2ban
fi

# Create Fail2Ban configuration
sudo tee /etc/fail2ban/jail.local > /dev/null << EOL
[sshd]
enabled = true
port = 22
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
bantime = 3600
EOL

# Restart Fail2Ban
sudo systemctl restart fail2ban

echo "Fail2Ban setup complete!"
