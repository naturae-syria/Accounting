# Accounting Distribution System

**Version 0.1**

This project is a Next.js based application for managing products, distribution centers, inventory and sales. It requires a PostgreSQL database and Redis for caching.

## Prerequisites

- Node.js 18+
- pnpm (installed globally)
- PostgreSQL
- Redis
- (Optional for production) PM2 and Nginx

## Quick start on Debian

If you are running Debian 12 you can use the automated installer:

```bash
sudo bash install-debian.sh
```

The script installs all dependencies, clones the repository and runs `setup-all.sh` to configure the system. You can override defaults by exporting variables before running the script, e.g.:

```bash
export APP_USER=myuser
export APP_DIR=/opt/accounting-system
export DB_USER=accounting
export DB_NAME=accounting_db
export DB_PASSWORD=secret
export REPO_URL=https://github.com/naturae-syria/Accounting.git
sudo bash install-debian.sh
```

## Manual setup

1. Install Node.js, pnpm, PostgreSQL and Redis on your machine.
2. Clone this repository and install the dependencies:

```bash
pnpm install
```

3. Copy `.env.example` to `.env` (or export the variables in your shell) and update the values as needed:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=accounting_system
DB_PASSWORD=postgres
DB_PORT=5432
REDIS_URL=redis://localhost:6379
```

4. Initialize the database:

```bash
pnpm run init-db
```

5. Start the development server:

```bash
pnpm dev
```

For production build and start:

```bash
pnpm build
pnpm start
```

## Custom reports

The dashboard includes a **Custom Reports** tab where you can define your own reports. Choose a report type, enter a name and comma separated columns, then add the report. Reports can be removed from the same tab. They are stored in the database via `/api/custom-reports`.

## Managing the application

For production deployments the application can be managed using **PM2**. After running `setup-pm2.sh` an `ecosystem.config.js` file is generated and the app is registered with the name `accounting-system`.
The `setup-all.sh` script also installs a helper command named `NexAccount` in `/usr/local/bin` to make management easier.
This command runs from `/var/www/accounting-system`, so you can invoke `NexAccount` anywhere on the system.

Run `NexAccount help` to display a summary of all available commands.

- **Start** the application

  ```bash
  NexAccount Start
  ```

- **Stop** the application

  ```bash
  NexAccount Stop
  ```

- **Restart** the application

  ```bash
  NexAccount Restart
  ```

- **Check status**

  ```bash
  NexAccount Status
  ```

Each of the `Start`, `Restart` and `Status` commands prints the current
service state along with the URLs for accessing the application.

- **Update** the application

  ```bash
  NexAccount Update
  ```

- **Delete** the PM2 process

  ```bash
  NexAccount Delete
  ```

- **View service logs**

  ```bash
  NexAccount Log
  ```

- **Help**

  ```bash
  NexAccount help
  ```

### Accessing the application

After running `setup-all.sh`, the install summary shows whether HTTPS was enabled. By default the site is available at:

- **HTTP**: `http://<your-domain-or-ip>` on port **80**
- **HTTPS**: `https://<your-domain-or-ip>` on port **443`** (when SSL is enabled)

### Service logs

Logs for the major components can be found in the following locations:

- **Nginx**: `/var/log/nginx/`
- **PM2/Application**: `~/.pm2/logs/`
- **PostgreSQL**: `/var/log/postgresql/`
- **Fail2Ban**: `/var/log/fail2ban.log`
- **UFW firewall**: `/var/log/ufw.log`

### Firewall

`setup-firewall.sh` configures UFW to open ports 22, 80, 443, 3000, 5432, 6379, 9090 and 9100 so the project operates correctly.

