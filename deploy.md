# 🚀 Stack_IT Deployment Guide

This guide will help you deploy your Stack_IT application to the cloud. We'll use:
- **Railway** for backend API and database
- **Vercel** for frontend hosting

## Prerequisites

Before starting, make sure you have:
- [Git](https://git-scm.com/) installed
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://python.org/) (v3.8+)
- A [GitHub](https://github.com/) account
- A [Railway](https://railway.app/) account (free)
- A [Vercel](https://vercel.com/) account (free)
- A [Clerk](https://clerk.com/) account (free)

## Step 1: Prepare Your Code

### Push to GitHub (if not already done)
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/yourusername/stack-it.git
git branch -M main
git push -u origin main
```

## Step 2: Set Up Database on Railway

1. Go to [Railway](https://railway.app/) and sign up/login
2. Click "New Project"
3. Select "Provision MySQL"
4. Once created, click on the MySQL service
5. Go to the "Variables" tab
6. Copy the `DATABASE_URL` (starts with `mysql://`)
7. Keep this URL safe - you'll need it for the backend

## Step 3: Deploy Backend to Railway

1. In Railway, click "New Project" → "Deploy from GitHub repo"
2. Select your Stack_IT repository
3. Railway will detect it's a Python project
4. Click on the deployed service
5. Go to "Variables" tab and add these environment variables:

   ```
   DATABASE_URL=mysql://your_database_url_from_step_2
   CLERK_SECRET_KEY=your_clerk_secret_key
   CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   FRONTEND_URL=https://your-app-name.vercel.app
   ```

6. Go to "Settings" → "General" → "Service Settings"
7. Set "Root Directory" to `backend`
8. Railway will automatically deploy your backend

## Step 4: Deploy Frontend to Vercel

1. Go to [Vercel](https://vercel.com/) and sign up/login
2. Click "New Project"
3. Select your Stack_IT GitHub repository
4. Configure project settings:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

5. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk publishable key
   - `VITE_API_URL`: Your Railway backend URL (e.g., `https://your-app.railway.app`)

6. Click "Deploy"

## Step 5: Update Environment Variables

### Backend (Railway)
Go to your Railway backend service → Variables:
```
DATABASE_URL=mysql://your_database_url
CLERK_SECRET_KEY=sk_test_your_secret_key
CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
FRONTEND_URL=https://your-vercel-app.vercel.app
```

### Frontend (Vercel)
Go to your Vercel project → Settings → Environment Variables:
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_your_publishable_key
VITE_API_URL=https://your-railway-app.railway.app
```

## Step 6: Configure Clerk

1. Go to your Clerk dashboard
2. Navigate to "Domains" section
3. Add your production domains:
   - Frontend: `https://your-vercel-app.vercel.app`
   - Backend: `https://your-railway-app.railway.app`

## Step 7: Test Your Deployment

1. Visit your Vercel frontend URL
2. Test user registration/login
3. Try creating a question
4. Check if voting works
5. Test all major features

## Troubleshooting

### Common Issues:

1. **CORS Errors**: Make sure your frontend URL is added to the CORS origins in `backend/app/main.py`

2. **Database Connection**: Verify your `DATABASE_URL` is correct in Railway

3. **Environment Variables**: Double-check all environment variables are set correctly

4. **Build Failures**: Check the build logs in Railway/Vercel for specific error messages

### Checking Logs:
- **Railway**: Go to your service → "Deployments" → Click on a deployment → "View Logs"
- **Vercel**: Go to your project → "Functions" → Click on a function → "View Logs"

## Custom Domain (Optional)

### For Vercel (Frontend):
1. Go to your Vercel project → "Settings" → "Domains"
2. Add your custom domain
3. Follow DNS configuration instructions

### For Railway (Backend):
1. Go to your Railway service → "Settings" → "Domains"
2. Add your custom domain
3. Update environment variables accordingly

## Monitoring

- **Railway**: Built-in monitoring and metrics
- **Vercel**: Analytics available in the dashboard
- **Clerk**: User management and authentication analytics

## Security Best Practices

1. Never commit `.env` files
2. Use environment variables for all secrets
3. Regularly rotate API keys
4. Enable HTTPS everywhere
5. Monitor for unusual activity

## Next Steps

After successful deployment:
1. Set up monitoring and alerts
2. Configure backups for your database
3. Set up CI/CD for automatic deployments
4. Consider setting up staging environments
5. Implement proper logging and error tracking

---

🎉 **Congratulations!** Your Stack_IT application is now live!

**Frontend URL**: https://your-vercel-app.vercel.app
**Backend URL**: https://your-railway-app.railway.app
**API Docs**: https://your-railway-app.railway.app/docs 