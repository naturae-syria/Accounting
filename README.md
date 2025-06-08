# Accounting Distribution System

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
sudo bash install-debian.sh
```

## Manual setup

1. Install Node.js, pnpm, PostgreSQL and Redis on your machine.
2. Clone this repository and install the dependencies:

```bash
pnpm install
```

3. Create a `.env` file (or export the variables in your shell) with the following variables:

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

