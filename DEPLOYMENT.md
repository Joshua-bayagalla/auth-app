# 🚀 Deployment Guide - DriveNow Rentals App

## 📋 **Prerequisites**
- GitHub account
- Render account (free)
- Your application code

## 🎯 **Option 1: Deploy to Render (Recommended)**

### **Step 1: Prepare Your Repository**
1. **Push your code to GitHub:**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Ensure these files exist:**
   - ✅ `render.yaml` (deployment configuration)
   - ✅ `backend/requirements.txt` (Python dependencies)
   - ✅ `vite.config.js` (Vite configuration)
   - ✅ `src/config.js` (API configuration)

### **Step 2: Deploy on Render**
1. **Go to [render.com](https://render.com)** and sign up/login
2. **Click "New +" → "Blueprint"**
3. **Connect your GitHub repository**
4. **Render will automatically detect the `render.yaml` file**
5. **Click "Apply" to deploy both services**

### **Step 3: Wait for Deployment**
- **Backend API**: ~5-10 minutes
- **Frontend**: ~3-5 minutes
- **Both services will get HTTPS URLs automatically**

### **Step 4: Update Frontend API URL**
1. **Go to your frontend service on Render**
2. **Copy the backend URL** (e.g., `https://drivenow-api.onrender.com`)
3. **Go to Environment Variables**
4. **Add**: `VITE_API_BASE_URL` = `https://drivenow-api.onrender.com`
5. **Redeploy frontend**

## 🌐 **Option 2: Deploy to Railway**

### **Step 1: Backend Deployment**
1. **Go to [railway.app](https://railway.app)**
2. **Connect GitHub repository**
3. **Select backend folder**
4. **Set environment variables:**
   - `PORT` = `8000`
5. **Deploy**

### **Step 2: Frontend Deployment**
1. **Create new service for frontend**
2. **Select frontend folder**
3. **Set build command:** `npm run build`
4. **Set start command:** `npx serve -s dist`
5. **Deploy**

## 🌐 **Option 3: Vercel + Railway**

### **Step 1: Deploy Backend to Railway**
1. **Follow Railway backend steps above**
2. **Copy the API URL**

### **Step 2: Deploy Frontend to Vercel**
1. **Go to [vercel.com](https://vercel.com)**
2. **Import your GitHub repository**
3. **Set environment variable:**
   - `VITE_API_BASE_URL` = `[your-railway-api-url]`
4. **Deploy**

## 🌐 **Option 4: Netlify + Render**

### **Step 1: Deploy Backend to Render**
1. **Follow Render backend steps above**
2. **Copy the API URL**

### **Step 2: Deploy Frontend to Netlify**
1. **Go to [netlify.com](https://netlify.com)**
2. **Import your GitHub repository**
3. **Set environment variable:**
   - `VITE_API_BASE_URL` = `[your-render-api-url]`
4. **Deploy**

## 🔧 **Environment Variables**

### **Backend (API)**
```bash
PORT=8000
PYTHON_VERSION=3.10.0
```

### **Frontend**
```bash
VITE_API_BASE_URL=https://your-api-url.com
```

## 📱 **Custom Domain (Optional)**

### **Render Custom Domain**
1. **Go to your service settings**
2. **Click "Custom Domains"**
3. **Add your domain**
4. **Update DNS records as instructed**

## 🚨 **Important Notes**

### **Free Tier Limitations**
- **Render**: 750 hours/month (usually enough for personal projects)
- **Railway**: $5 credit/month
- **Vercel**: 100GB bandwidth/month
- **Netlify**: 100GB bandwidth/month

### **File Storage**
- **Uploads are temporary** on free tiers
- **Consider using cloud storage** (AWS S3, Cloudinary) for production
- **Database**: Use free tier databases (Render PostgreSQL, Railway PostgreSQL)

### **Auto-Deploy**
- **All platforms support auto-deploy** from GitHub
- **Push to main branch** = automatic deployment
- **Environment variables** need to be set manually

## 🎉 **After Deployment**

### **Test Your App**
1. **Frontend URL**: `https://your-app.onrender.com`
2. **Backend API**: `https://your-api.onrender.com`
3. **Health Check**: `https://your-api.onrender.com/health`

### **Update Documentation**
- **Update README.md** with live URLs
- **Share with users** the new production URLs

## 🆘 **Troubleshooting**

### **Common Issues**
1. **CORS Errors**: Check CORS configuration in backend
2. **Build Failures**: Check requirements.txt and package.json
3. **Environment Variables**: Ensure all variables are set
4. **Port Issues**: Use `$PORT` environment variable

### **Support**
- **Render**: [docs.render.com](https://docs.render.com)
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)
- **Netlify**: [docs.netlify.com](https://docs.netlify.com)

## 🎯 **Recommended Deployment Flow**

1. **Start with Render** (easiest, supports both frontend/backend)
2. **Test thoroughly** on free tier
3. **Scale up** if needed (paid plans available)
4. **Add custom domain** for professional look
5. **Set up monitoring** and alerts

---

**Happy Deploying! 🚀**
