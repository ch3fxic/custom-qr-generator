# Deployment Guide

This guide provides detailed instructions for deploying your Custom QR Generator to various platforms.

## 📋 Pre-Deployment Checklist

- [ ] All code is committed to Git
- [ ] Backend `.env` file is configured
- [ ] Frontend `config.js` API_URL is set
- [ ] Database is working locally
- [ ] CORS settings are configured

---

## 🌐 Frontend Deployment (GitHub Pages)

GitHub Pages is free and perfect for static sites.

### Step 1: Prepare Repository

1. **Create a GitHub repository:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/ch3fxic/custom-qr-generator.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages**
3. Under "Source", select:
   - Branch: `main`
   - Folder: `/frontend` or `/ (root)` if frontend is in root
4. Click **Save**
5. Wait 2-5 minutes for deployment

### Step 3: Update Configuration

Your site will be at: `https://ch3fxic.github.io/custom-qr-generator/`

Update `frontend/js/config.js`:
```javascript
const CONFIG = {
    API_URL: 'https://your-backend-url.vercel.app', // Your backend URL
    // ...
};
```

Push the changes:
```bash
git add frontend/js/config.js
git commit -m "Update API URL for production"
git push
```

### Alternative: Custom Domain

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. In GitHub Pages settings, add your custom domain
3. In your domain registrar, add DNS records:
   ```
   Type: CNAME
   Name: @
   Value: ch3fxic.github.io
   ```

---

## ⚡ Backend Deployment (Vercel)

Vercel offers free hosting for Node.js applications.

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From project root
vercel
```

Follow the prompts:
- Link to existing project? **No**
- Project name? (use default or custom)
- Directory? `./backend`

### Step 4: Configure Environment Variables

In Vercel Dashboard:
1. Go to your project
2. Click **Settings** → **Environment Variables**
3. Add:
   ```
   NODE_ENV=production
   FRONTEND_URL=https://your-username.github.io
   PORT=3000
   DATABASE_PATH=/tmp/database.sqlite
   ```

### Step 5: Production Deployment

```bash
vercel --prod
```

Your backend URL will be: `https://your-project.vercel.app`

### Important Notes for Vercel:

- SQLite database is stored in `/tmp` (ephemeral)
- Consider using a cloud database (MongoDB, PostgreSQL) for persistence
- Free tier has limitations on execution time

---

## 🚂 Backend Deployment (Railway)

Railway offers easy deployment with persistent storage.

### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

### Step 2: Login

```bash
railway login
```

### Step 3: Initialize Project

```bash
cd backend
railway init
```

### Step 4: Deploy

```bash
railway up
```

### Step 5: Add Environment Variables

```bash
railway variables set NODE_ENV=production
railway variables set FRONTEND_URL=https://your-username.github.io
railway variables set PORT=3000
railway variables set DATABASE_PATH=./database.sqlite
```

### Step 6: Get Your URL

```bash
railway domain
```

### Persistent Storage on Railway:

Railway supports volumes for persistent storage:
```bash
railway volume create database-volume
railway volume attach database-volume /app/data
```

Update `DATABASE_PATH` to `/app/data/database.sqlite`

---

## 🎨 Backend Deployment (Render)

Render offers free tier with persistent disks.

### Step 1: Create Account

Go to [render.com](https://render.com) and sign up.

### Step 2: Create New Web Service

1. Click **New** → **Web Service**
2. Connect your GitHub repository
3. Configure:
   - **Name:** qr-generator-backend
   - **Environment:** Node
   - **Branch:** main
   - **Root Directory:** backend
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`

### Step 3: Add Environment Variables

In service settings, add:
```
NODE_ENV=production
FRONTEND_URL=https://your-username.github.io
PORT=3000
DATABASE_PATH=./database.sqlite
```

### Step 4: Add Persistent Disk (Important!)

1. Go to service settings
2. Click **Disks**
3. Add a new disk:
   - **Name:** database
   - **Mount Path:** `/app/data`
   - **Size:** 1GB (free tier)

4. Update environment variable:
   ```
   DATABASE_PATH=/app/data/database.sqlite
   ```

### Step 5: Deploy

Render will automatically deploy when you push to GitHub.

Your backend URL: `https://your-service.onrender.com`

---

## 🐳 Docker Deployment (Advanced)

### Backend Dockerfile

Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Docker Compose

Create `docker-compose.yml`:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - FRONTEND_URL=https://your-frontend.com
      - DATABASE_PATH=/app/data/database.sqlite
    volumes:
      - db-data:/app/data

volumes:
  db-data:
```

### Deploy

```bash
docker-compose up -d
```

---

## 🗄️ Database Options

### SQLite (Default)

**Pros:** Simple, no setup
**Cons:** Not ideal for high traffic, ephemeral on some platforms

**Good for:** Development, low traffic, single-server deployment

### MongoDB (Recommended for Production)

1. **Sign up for MongoDB Atlas** (free tier available)
2. **Create a cluster**
3. **Get connection string**
4. **Install MongoDB driver:**
   ```bash
   cd backend
   npm install mongodb
   ```
5. **Update database code** to use MongoDB instead of SQLite

### PostgreSQL

1. **Use a service like:**
   - Supabase (free tier)
   - Neon (free tier)
   - Railway (built-in)
   - Render (built-in)

2. **Install PostgreSQL driver:**
   ```bash
   npm install pg
   ```

---

## 🔒 Security Checklist

Before going to production:

- [ ] Update CORS origins to only your frontend domain
- [ ] Enable rate limiting
- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Consider hashing/encrypting IP addresses (GDPR)
- [ ] Add authentication for admin endpoints
- [ ] Monitor error logs
- [ ] Set up database backups

---

## 🔍 Monitoring & Maintenance

### Health Checks

Your backend has a health endpoint:
```
GET /health
```

Use monitoring services like:
- UptimeRobot (free)
- Better Uptime
- Pingdom

### Logs

**Vercel:** View logs in dashboard
**Railway:** `railway logs`
**Render:** View logs in dashboard

### Database Backups

**Railway:**
```bash
railway run pg_dump DATABASE_URL > backup.sql
```

**Render:** Enable automated backups in disk settings

---

## 🆘 Troubleshooting

### Common Issues

**1. CORS Errors**
- Verify `FRONTEND_URL` matches exactly (no trailing slash)
- Check browser console for specific origin

**2. Database Connection Errors**
- Check file permissions
- Verify `DATABASE_PATH`
- On Vercel, use cloud database instead

**3. 404 on API Calls**
- Verify `API_URL` in frontend config
- Check backend logs
- Test endpoints with curl/Postman

**4. Rate Limiting**
- Check rate limit settings in `.env`
- Whitelist your own IP for testing

### Debug Mode

Add to backend `.env`:
```
DEBUG=true
LOG_LEVEL=debug
```

---

## 📊 Scaling

When your app grows:

1. **Use a CDN** for frontend (Cloudflare)
2. **Switch to cloud database** (MongoDB, PostgreSQL)
3. **Add caching** (Redis)
4. **Load balancing** (multiple backend instances)
5. **Queue system** for analytics (Bull, RabbitMQ)

---

## 🎉 Done!

Your QR Generator should now be live!

**Frontend:** `https://your-username.github.io/custom-qr-generator/`
**Backend:** `https://your-backend.vercel.app/`

Share it with the world! 🌍
