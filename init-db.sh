#!/bin/bash

# Wait until the database is ready
echo "Waiting for the database to be ready..."
until node -e "
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
  pool.query('SELECT 1').then(() => {
  console.log('Database connection successful');
  process.exit(0);
}).catch(err => {
  console.error('Database connection error:', err);
  process.exit(1);
});
"; do
  echo "Database not ready yet... waiting 2 seconds"
  sleep 2
done

# Initialize the database
echo "Initializing the database..."
if [ ! -x node_modules/.bin/ts-node ]; then
    echo "Node dependencies not installed."
    echo "Please run 'pnpm install' before executing this script."
    exit 1
fi
pnpm run init-db
