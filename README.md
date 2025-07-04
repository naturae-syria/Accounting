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

Temporary files generated during installation are automatically removed by
`cleanup-temp.sh` which runs at the end of the installer.

The installer also downloads the **Tajawal** font so the build can run offline.
Font files are not stored in the repository and will be placed under
`public/fonts/Tajawal` after running the script.

## Manual setup

1. Install Node.js, pnpm, PostgreSQL and Redis on your machine.
2. Clone this repository and install the dependencies:

```bash
pnpm install
```

The Tajawal font files will be downloaded automatically during installation
and placed under `public/fonts/Tajawal`.

3. Copy `.env.example` to `.env` (or export the variables in your shell) and update the values as needed. These credentials are used to create the initial admin account and will be hashed before storage:

```env
DB_USER=postgres
DB_HOST=localhost
DB_NAME=accounting_system
DB_PASSWORD=postgres
DB_PORT=5432
REDIS_URL=redis://localhost:6379
ADMIN_USER=admin      # default admin username
ADMIN_PASS=admin123   # default admin password
```

These credentials will be hashed when the database is initialized. Update them
as needed for production environments.

4. Initialize the database:

```bash
pnpm run init-db
```
This command runs `ts-node -P tsconfig.init.json ./lib/db.ts` which tests the
database connection, creates the tables and seeds example data. You can also run
the same command manually if needed:

```bash
ts-node -P tsconfig.init.json ./lib/db.ts
```

**Note**: If `psql` reports `FATAL: role "root" does not exist`, use the
`postgres` role to connect:

```bash
sudo -u postgres psql
# or
psql -U postgres
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
The `start` command now runs an Express server that hosts the Next.js application and authentication API.
By default the server listens on port 3000. Open `http://localhost:3000` in your browser (or replace `localhost` with your server's IP or domain).
If you define the `NEXT_BASE_PATH` environment variable when building, append that path to the URL (e.g. `http://localhost:3000$NEXT_BASE_PATH`).

## Using Docker

The repository includes a `docker-compose.yml` file that starts the application,
PostgreSQL and an Nginx reverse proxy. To launch the stack:

```bash
docker-compose up -d
```

Access the app via `http://localhost` once the containers are running. When
finished, stop the services with:

```bash
docker-compose down
```


## Custom reports

The dashboard includes a **Custom Reports** tab where you can define your own reports. Choose a report type, enter a name and comma separated columns, then add the report. Reports can be removed from the same tab. They are stored in the database via `/api/custom-reports`.

## Authentication

Authentication uses a simple session cookie. A successful POST to `/api/auth/login` sets a `session` cookie with the `httpOnly`, `secure` and `sameSite=lax` flags enabled. The cookie expires after seven days. Logging out via `/api/auth/logout` clears this cookie using the same options. A GET request to `/api/auth/check` returns `{ valid: true }` when the session cookie is present and valid.

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

- **Database update**

  ```bash
  NexAccount DbUpdate
  ```

  Use this command to verify the database schema and rebuild static files.
  It may fetch missing files from Git and requires root or `sudo` privileges
  because system services are restarted.

- **Update the web server configuration**

  ```bash
  NexAccount Webserver
  ```

  Ensures Nginx is installed, configured and restarted.

- **Delete** the PM2 process

  ```bash
  NexAccount Delete
  ```

- **View service logs**

  ```bash
  NexAccount Log
  ```

- **Generate a usernames file**

  ```bash
  NexAccount Pass
  ```

- **Help**

  ```bash
  NexAccount help
  ```

### Database update steps

`NexAccount DbUpdate` performs the following actions:

1. Runs `pnpm run init-db` to confirm the database schema matches the expected structure.
2. Verifies that `lib/db.ts`, `next.config.mjs` and `docker-compose.yml` exist.
3. Generates static pages using `pnpm build`.
4. If differences are detected, fetches the above files from Git and reinstalls dependencies.
5. Restarts the PM2 process along with PostgreSQL, Redis and Nginx services.

### Accessing the application

After running `setup-all.sh`, the install summary shows whether HTTPS was enabled. By default the site is available at:

- **HTTP**: `http://<your-domain-or-ip>` on port **80**
- **HTTPS**: `https://<your-domain-or-ip>` on port **443`** (when SSL is enabled)
- **Direct**: `http://<your-domain-or-ip>:3000` if Nginx is not configured or port 80 shows the default page.
Nginx must be configured using `setup-nginx.sh` (or via `setup-all.sh`) for ports 80 and 443 to serve the app.

### Service logs

Logs for the major components can be found in the following locations:

- **Nginx**: `/var/log/nginx/`
- **PM2/Application**: `~/.pm2/logs/`
- **PostgreSQL**: `/var/log/postgresql/`
- **Fail2Ban**: `/var/log/fail2ban.log`
- **UFW firewall**: `/var/log/ufw.log`

### Firewall

`setup-firewall.sh` configures UFW to open ports 22, 80, 443, 3000, 5432, 6379, 9090 and 9100 so the project operates correctly.

### Monitoring setup

Run `setup-monitoring.sh` to install Prometheus for basic metrics collection.


