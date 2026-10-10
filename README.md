# Durapure

Durapure is a small storefront for selected durian from Vietnam's Mekong Delta. It includes a static web frontend, an Express API, and a PostgreSQL database.

## Run the complete app

Install [Docker Desktop](https://www.docker.com/products/docker-desktop/), then run this command in the repository folder:

```bash
docker compose up --build
```

Open:

- Storefront: http://localhost:8000
- Admin page: http://localhost:8000/admin.html
- API health check: http://localhost:5000/api/health

Demo admin login:

- Email: `admin@durapure.vn`
- Password: `Admin@123`

The first startup creates the database and loads the included sample products. Database data and uploaded files remain available after containers restart.

## Stop or restart

Stop the app while keeping its data:

```bash
docker compose down
```

Start it again:

```bash
docker compose up --build
```

Reset all local database and upload data to the original sample state:

```bash
docker compose down --volumes
docker compose up --build
```

The reset command permanently removes only this Docker Compose project's local volumes.

## Optional email setup

Checkout works without email credentials, but confirmation email requires SMTP settings. Copy `.env.example` to `.env`, fill in `SMTP_USER` and `SMTP_PASS`, and never commit that `.env` file.

## Project layout

- `BanCafe/wwwroot`: browser frontend and Durapure images
- `BanCafe/backend`: Node.js API and PostgreSQL initialization
- `BanCafe`: optional .NET Framework WebView2 desktop wrapper
- `compose.yaml`: complete local environment
## Deploy on Render

This repository includes a Render Blueprint that creates one Docker web service and one PostgreSQL database in Singapore.

1. Push the repository to GitHub.
2. Open https://dashboard.render.com/blueprints and select **New Blueprint Instance**.
3. Connect the `hieucao2404/Durapure-Web` repository.
4. Confirm the resources and select **Apply**.
5. Wait for the database setup and web deployment to finish, then open the generated `onrender.com` URL.

The free configuration is suitable for a preview. Free web services can sleep when idle, free PostgreSQL expires after 30 days, SMTP ports are unavailable, and uploaded files are not persistent across redeploys. Use paid PostgreSQL and a paid web service with a persistent disk before accepting real orders.