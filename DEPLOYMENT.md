# Zahir and Batin — BigCapital Homelab Deployment Guide

This guide explains how to install and run BigCapital on your Proxmox homelab.
It is written for someone comfortable with Proxmox, but who may not have deep Docker experience.

---

## What you will end up with

A self-hosted accounting system running on your Proxmox server, accessible:
- **Locally** at `http://<your-proxmox-ip>` from within your network
- **Remotely** via Cloudflare Tunnel (configured separately, when ready)

All data — financial records, receipt photos — stays on your hardware.

---

## Prerequisites

Before starting, make sure you have:

- [ ] A Proxmox VE node running (one of your Lenovo M920q units)
- [ ] A Proxmox LXC container or VM with at least:
  - 2 CPU cores
  - 4 GB RAM (8 GB recommended)
  - 20 GB storage (for the system + database; attachments go to MinIO volume)
- [ ] Ubuntu 22.04 LTS installed inside the LXC (recommended OS)
- [ ] Docker and Docker Compose installed inside the LXC (see Step 1)
- [ ] Port 80 on the LXC available and not blocked by the Proxmox firewall
- [ ] A mounted TrueNAS share (for backups, optional at first)

---

## Step 1 — Prepare the LXC container

SSH into your LXC container, then run:

```bash
# Update the system
apt update && apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com | sh

# Add your user to the Docker group (so you don't need sudo every time)
usermod -aG docker $USER

# Verify Docker is working
docker --version
docker compose version
```

Log out and back in for the group change to take effect.

---

## Step 2 — Clone the repository

```bash
# Go to the directory where you want to install the app
cd /opt

# Clone the Z&B BigCapital repository
git clone https://github.com/emuchemi/zb-bigcapital.git

# Enter the project directory
cd zb-bigcapital
```

---

## Step 3 — Create your environment file

The `.env` file contains all your configuration, passwords, and API keys.
It is never committed to Git — it lives only on your server.

```bash
# Copy the example file
cp .env.homelab.example .env

# Open it in a text editor
nano .env
```

Work through the file and fill in every value marked `← CHANGE THIS`.
The most important ones are:

| Variable | What it is | How to set it |
|---|---|---|
| `BASE_URL` | Your server's local IP | e.g. `http://192.168.1.50` |
| `JWT_SECRET` | Signs login tokens | Run: `openssl rand -hex 32` |
| `DB_PASSWORD` | Database password | Run: `openssl rand -hex 16` |
| `DB_ROOT_PASSWORD` | Database root password | Run: `openssl rand -hex 16` |
| `MINIO_ROOT_PASSWORD` | File storage password | Run: `openssl rand -hex 20` |
| `SIGNUP_ALLOWED_EMAILS` | Who can log in | Your email address |
| `OPEN_EXCHANGE_RATE_APP_ID` | Exchange rate API | See Step 4 |

Save the file when done (`Ctrl+X`, then `Y`, then `Enter` in nano).

---

## Step 4 — Get a free exchange rate API key

This allows the system to look up live TZS/USD/EUR/GBP exchange rates.

1. Go to [openexchangerates.org/signup/free](https://openexchangerates.org/signup/free)
2. Create a free account
3. Copy your App ID from the dashboard
4. Add it to your `.env` file: `OPEN_EXCHANGE_RATE_APP_ID=your_app_id_here`

The free tier gives you 1,000 API calls per month, which is more than sufficient.

---

## Step 5 — First run

This command starts all services. The first run takes 3–5 minutes because Docker
needs to download the container images and run the database setup.

```bash
# Start all services
docker compose -f docker-compose.homelab.yml --env-file .env up -d

# Watch the startup progress
docker compose -f docker-compose.homelab.yml logs -f
```

You will see messages from each service starting up. When you see:

```
zb-server    | Server is running on port 3000
zb-nginx     | ... nginx: configuration file ... test is successful
```

The application is ready. Press `Ctrl+C` to stop watching logs (the app keeps running).

### What happens on first run

1. MariaDB starts and creates the databases
2. The migration service runs and builds all database tables
3. MinIO starts and the setup service creates the attachments bucket
4. Redis starts
5. Gotenberg (PDF service) starts
6. Nginx starts and routes traffic
7. The webapp and server start

---

## Step 6 — Open the application

In a browser on your local network, go to:

```
http://<your-lxc-ip>
```

For example: `http://192.168.1.50`

You will see the BigCapital sign-up page on first visit.

**Sign up for your admin account:**
1. Use your own email address (must match one in `SIGNUP_ALLOWED_EMAILS`)
2. Create a strong password (save it in Bitwarden)
3. You will be asked to create your first organisation — this is Zahir and Batin Limited

---

## Step 7 — Initial organisation setup inside the app

Once logged in, configure the organisation:

1. Go to **Settings → Organisation**
2. Set:
   - Company name: `Zahir and Batin Limited`
   - Base currency: `TZS`
   - Financial year start: `January`
   - Country: `Tanzania` (closest option — Zanzibar is part of Tanzania)
   - Time zone: `Africa/Dar_es_Salaam`

3. Go to **Settings → Currencies** and add:
   - USD (US Dollar)
   - EUR (Euro)
   - GBP (British Pound)

4. Upload the Z&B logo in **Settings → Organisation** (use `transparent.png`)

---

## Step 8 — Invite the accountant (remote access)

Before inviting the accountant, you need to either:

**Option A (local only, now):** Share your local network — the accountant connects via VPN (WireGuard) to your homelab network, then accesses `http://<your-ip>`.

**Option B (Cloudflare Tunnel, later):** Set up Cloudflare Tunnel so the app is accessible at a domain like `finance.zahirandbatin.com`. See the Cloudflare section below.

Once accessible, invite the accountant:
1. Go to **Settings → Users**
2. Click **Invite User**
3. Enter their email address and assign the **Accountant** role

---

## Managing the application

### Start the application
```bash
cd /opt/zb-bigcapital
docker compose -f docker-compose.homelab.yml --env-file .env up -d
```

### Stop the application
```bash
docker compose -f docker-compose.homelab.yml down
```

### Restart a single service
```bash
docker compose -f docker-compose.homelab.yml restart server
```

### View logs
```bash
# All services
docker compose -f docker-compose.homelab.yml logs -f

# One service only
docker compose -f docker-compose.homelab.yml logs -f server
docker compose -f docker-compose.homelab.yml logs -f mysql
```

### Check service status
```bash
docker compose -f docker-compose.homelab.yml ps
```

### Update to a new version of BigCapital
```bash
# Pull new images
docker compose -f docker-compose.homelab.yml pull

# Restart with new images (migrations run automatically)
docker compose -f docker-compose.homelab.yml up -d
```

---

## Backups

**Never skip backups. Your financial records are stored in MariaDB and MinIO.**

### Automated backup (recommended)

The backup script at `docker/backup/backup.sh` will:
- Dump the MariaDB database to a timestamped file
- Back up MinIO attachment storage
- Delete backups older than 30 days
- Sync to your TrueNAS mount

Set it up as a cron job to run nightly:

```bash
# Make the script executable
chmod +x /opt/zb-bigcapital/docker/backup/backup.sh

# Open the cron scheduler
crontab -e

# Add this line to run the backup every night at 2:00 AM
0 2 * * * /opt/zb-bigcapital/docker/backup/backup.sh >> /var/log/zb-backup.log 2>&1
```

### Manual backup (on demand)

```bash
# Run backup now
/opt/zb-bigcapital/docker/backup/backup.sh
```

### Manual database dump (quick backup before making changes)

```bash
# Dump all databases to a file
docker exec zb-mysql mysqldump \
  -u root -p"${DB_ROOT_PASSWORD}" \
  --all-databases \
  > /tmp/zb-manual-backup-$(date +%Y%m%d-%H%M%S).sql
```

### Restore from backup

```bash
# Stop the application first
docker compose -f docker-compose.homelab.yml down

# Start only the database
docker compose -f docker-compose.homelab.yml up -d mysql

# Wait 15 seconds for MySQL to start
sleep 15

# Restore from backup file
docker exec -i zb-mysql mysql \
  -u root -p"${DB_ROOT_PASSWORD}" \
  < /path/to/your/backup-file.sql

# Start everything
docker compose -f docker-compose.homelab.yml up -d
```

---

## Remote access via Cloudflare Tunnel

Cloudflare Tunnel lets you access your homelab app from anywhere without opening
ports on your router or exposing your home IP address.

**When you are ready to set this up:**

### 1. Install cloudflared in your LXC

```bash
# Download and install cloudflared
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb \
  -o cloudflared.deb
dpkg -i cloudflared.deb
```

### 2. Log in to Cloudflare

```bash
cloudflared tunnel login
```

This opens a browser window. Log in with your Cloudflare account.

### 3. Create the tunnel

```bash
cloudflared tunnel create zb-bigcapital
```

Note the tunnel ID shown (a long UUID string).

### 4. Create the configuration file

```bash
mkdir -p ~/.cloudflared
nano ~/.cloudflared/config.yml
```

Paste this (replace `YOUR-TUNNEL-ID` and `your-domain.com`):

```yaml
tunnel: YOUR-TUNNEL-ID
credentials-file: /root/.cloudflared/YOUR-TUNNEL-ID.json

ingress:
  - hostname: finance.your-domain.com
    service: http://localhost:80
  - service: http_status:404
```

### 5. Add a DNS record in Cloudflare

```bash
cloudflared tunnel route dns zb-bigcapital finance.your-domain.com
```

### 6. Run the tunnel as a service

```bash
cloudflared service install
systemctl start cloudflared
systemctl enable cloudflared
```

### 7. Update BASE_URL in your .env

```
BASE_URL=https://finance.your-domain.com
```

Then restart the server:
```bash
docker compose -f docker-compose.homelab.yml restart server
```

---

## Security checklist

Before allowing remote access, confirm:

- [ ] `JWT_SECRET` is a strong random value (not the default)
- [ ] `DB_PASSWORD` and `DB_ROOT_PASSWORD` are strong random values
- [ ] `MINIO_ROOT_PASSWORD` is a strong random value
- [ ] `SIGNUP_DISABLED=true` in your `.env`
- [ ] `SIGNUP_ALLOWED_EMAILS` lists only your team's email addresses
- [ ] Port 3306 (database) is NOT exposed externally (it is not in our Docker Compose)
- [ ] Port 6379 (Redis) is NOT exposed externally (it is not in our Docker Compose)
- [ ] MinIO admin console (port 9001) is bound to `127.0.0.1` only (local access only)
- [ ] Cloudflare Tunnel is used for remote access (not open port forwarding)
- [ ] Backups are running and verified

---

## MinIO file storage admin console

MinIO has a web-based admin panel where you can see stored receipt photos and documents.

Access it at: `http://<your-lxc-ip>:9001`

This is only accessible from within your local network (or via VPN).
Log in with your `MINIO_ROOT_USER` and `MINIO_ROOT_PASSWORD`.

---

## Troubleshooting

### The app doesn't start

```bash
# Check which services have problems
docker compose -f docker-compose.homelab.yml ps

# Check logs for errors
docker compose -f docker-compose.homelab.yml logs --tail=50
```

### Database connection errors

Usually means the database hasn't fully started yet. Wait 30 seconds and try:

```bash
docker compose -f docker-compose.homelab.yml restart server
```

### Receipt uploads fail

Check MinIO is running:

```bash
docker compose -f docker-compose.homelab.yml ps minio
docker compose -f docker-compose.homelab.yml logs minio
```

Check the bucket exists:

```bash
docker exec zb-minio-setup mc ls zb/
```

### "403 Forbidden" or login issues

Check that your email is in `SIGNUP_ALLOWED_EMAILS` in your `.env` file.
After changing `.env`, restart the server:

```bash
docker compose -f docker-compose.homelab.yml restart server
```

### Exchange rates not updating

Check your API key:

```bash
docker compose -f docker-compose.homelab.yml logs server | grep -i "exchange"
```

Verify `OPEN_EXCHANGE_RATE_APP_ID` is set correctly in your `.env`.

---

## Storage locations

| Data | Where it lives | How to back it up |
|---|---|---|
| All accounting records | `zb_mysql` Docker volume (MariaDB) | `backup.sh` or manual mysqldump |
| Receipt photos and attachments | `zb_minio` Docker volume (MinIO) | `backup.sh` syncs to TrueNAS |
| Redis cache | `zb_redis` Docker volume | Not critical — regenerated automatically |
| Application code | `/opt/zb-bigcapital` directory | Update via `git pull` |
| Configuration | `/opt/zb-bigcapital/.env` | Keep a secure offline copy in Bitwarden |

---

## Getting help

If something goes wrong, collect this information before asking for help:

```bash
# System info
docker --version
docker compose version
uname -a

# Service status
docker compose -f docker-compose.homelab.yml ps

# Recent logs
docker compose -f docker-compose.homelab.yml logs --tail=100 > /tmp/zb-logs.txt
```
