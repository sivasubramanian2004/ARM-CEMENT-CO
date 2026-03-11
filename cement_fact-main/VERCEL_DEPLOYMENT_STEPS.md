# Quick Vercel Deployment Guide

## Step 1: Create Vercel Account
- Go to https://vercel.com/signup
- Sign up with GitHub (recommended for easy integration)

## Step 2: Connect Your Repository
- Link your GitHub repository to Vercel
- Vercel will auto-detect the monorepo structure

## Step 3: Configure Project Settings in Vercel Dashboard

**Framework Preset:** Node.js
**Build Command:** 
```
cd client && npm install && npm run build
```

**Output Directory:** `client/dist`

**Root Directory:** `.` (current)

## Step 4: Add Environment Variables
In Vercel Dashboard → Settings → Environment Variables, add:

```
MONGODB_URI=mongodb+srv://shivasubramanian3332_db_user:jemO9Nrc7XE7M4wK@cluster0.otowkin.mongodb.net/cementfactory
JWT_SECRET=cement_factory_jwt_secret_2025_production
ADMIN_NAME=sivasubramanian
ADMIN_EMAIL=shivasubramanian3332@gmail.com
ADMIN_PASSWORD=sivas2004
```

(Recommended: Use Vercel's secret management to store sensitive values)

## Step 5: MongoDB Atlas Setup
1. Go to MongoDB Atlas → Network Access
2. Add IP Whitelist entry: `0.0.0.0/0` (allows all Vercel IPs)
   - Or add specific Vercel IP ranges for security

## Step 6: Deploy
- Push changes to GitHub
- Vercel automatically deploys on every push to main branch
- Or click "Deploy" button in Vercel dashboard

## Step 7: Verify Deployment
After deployment, test:

1. **Health Check:**
   ```
   https://<your-project>.vercel.app/api/health
   ```
   Should return: `{"status":"ok","service":"cement-steel-backend"}`

2. **Frontend:**
   ```
   https://<your-project>.vercel.app
   ```

3. **Register Test User:**
   ```bash
   curl -X POST https://<your-project>.vercel.app/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123"
     }'
   ```

## Troubleshooting

**Build Fails:**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Verify Node version compatibility

**MongoDB Connection Error:**
- Whitelist Vercel IP in MongoDB Atlas
- Check MONGODB_URI format in environment variables
- Ensure MongoDB cluster allows connections from 0.0.0.0/0

**CORS Errors:**
- Frontend should use relative path `/api` (already configured)
- Backend CORS is set to allow all origins

**Cold Start Delays:**
- Normal for serverless; first request takes 3-5 seconds
- Subsequent requests are instant

## Project URLs After Deployment
- **Main App:** https://<your-project>.vercel.app
- **API Root:** https://<your-project>.vercel.app/api
- **Products:** https://<your-project>.vercel.app/api/products
- **Auth:** https://<your-project>.vercel.app/api/auth
- **Orders:** https://<your-project>.vercel.app/api/orders

## Manual Deployment via GitHub

If you prefer CLI-free deployment:

1. Push code to GitHub:
   ```bash
   git add .
   git commit -m "Prepare for Vercel deployment"
   git push origin main
   ```

2. In Vercel Dashboard:
   - Click "New Project"
   - Import your GitHub repository
   - Vercel auto-configures with vercel.json
   - Add environment variables
   - Click "Deploy"

Done! Your app is live.
