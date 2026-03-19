# Deployment Guide

## Option 1: Vercel (Recommended for quick setup)

### Frontend + Backend on Vercel

1. **Install Vercel CLI**
   ```
   npm i -g vercel
   ```

2. **Configure Backend Environment Variables**
   Create a `.env.production` in the `server` folder with your production MongoDB URI and secrets.

3. **Update Frontend API URL**
   Create `client/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-vercel-deployment.vercel.app/api
   ```

4. **Deploy**
   ```
   vercel --prod
   ```
   When prompted, link to your GitHub repository or deploy directly.

5. **Set Environment Variables in Vercel Dashboard**
   - Go to your project settings → Environment Variables
   - Add all variables from `server/.env`:
     - `MONGODB_URI`
     - `JWT_SECRET`
     - `ADMIN_NAME`
     - `ADMIN_EMAIL`
     - `ADMIN_PASSWORD`

### Verify Deployment
- Frontend: `https://your-project.vercel.app`
- API Health: `https://your-project.vercel.app/api/health`

---

## Option 2: Separate Deployments (Better for production)

### Backend on Railway, Render, or Heroku
- Both platforms support Node.js with persistent connections
- Better for production workloads

### Frontend on Vercel
1. Update `client/.env.production`:
   ```
   VITE_API_BASE_URL=https://your-backend-url.com/api
   ```

2. Deploy frontend:
   ```
   vercel --prod
   ```

---

## Common Issues & Solutions

**Port issues on Vercel:**
- Vercel serverless functions run in `/api` directory
- Use environment-aware port binding

**MongoDB Connection Timeouts:**
- Whitelist Vercel IP range in MongoDB Atlas: `0.0.0.0/0` (or specific IPs)
- Use connection pooling in production

**CORS Errors:**
- Update `server/src/index.js` CORS origin to allow Vercel domain

**Cold Starts:**
- Vercel serverless has ~5s cold start; acceptable for most use cases
- Consider using Railway/Render for persistent backend if performance critical

---

## After Deployment

1. Seed admin user (via API):
   ```bash
   curl -X POST https://your-project.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"name":"admin","email":"admin@test.com","password":"changeMe123"}'
   ```

2. Update admin role in MongoDB Atlas:
   - In `users` collection, change `role: "customer"` to `role: "admin"`

3. Test login and product management

---

## Environment Variables Reference

```
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
PORT=4000 (ignored on Vercel)
JWT_SECRET=your-secret-key
ADMIN_NAME=Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
```
