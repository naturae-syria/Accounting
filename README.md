diff --git a/README.md b/README.md
index 1b1be958cf2c33a8b1935a89eab674397418cbaa..213a0dc7c7bd47e968248aacb9a19c8bab6244ae 100644
--- a/README.md
+++ b/README.md
@@ -106,50 +106,58 @@ and its dependencies in containers.
    ```bash
    ./run-docker.sh
    ```
 
    The script waits for PostgreSQL to be ready and then runs the database
    initializer before bringing the app online. Access it via
    `http://localhost`.
 
 4. **View logs and troubleshoot** container issues:
 
    ```bash
    docker-compose logs -f         # Follow service logs
    docker-compose ps              # Check container status
    ```
 
    If a container fails to start you can inspect it with
    `docker-compose logs <service>` or restart it using `docker-compose
    restart <service>`.
 
 5. **Stop the services** when finished:
 
    ```bash
    docker-compose down
    ```
 
+For a completely automated installation that clones the repository's `docker` branch and sets up Docker with all dependencies, run:
+
+```bash
+bash install-docker-e2e.sh
+```
+
+This script ensures Docker is installed, pulls the repository and starts the containers using `run-docker.sh`.
+
 
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
 
