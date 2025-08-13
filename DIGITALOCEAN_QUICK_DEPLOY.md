# 🌊 DigitalOcean Quick Deploy Guide

## 🚀 **Deploy in 5 Minutes**

### **1. Go to DigitalOcean**
- Visit: https://cloud.digitalocean.com/apps
- Click **"Create App"**

### **2. Choose Source**
- Select **"GitHub"**
- Connect your GitHub account
- Select repository: `Joshua-bayagalla/auth-app`
- Select branch: `main`

### **3. Configure App**
- **App Name**: `auth-app-backend`
- **Source Directory**: `/backend` ⭐ **IMPORTANT!**
- **Environment**: `Python`
- **Build Command**: Leave empty (auto-detected)
- **Run Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`

### **4. Choose Plan**
- **Plan**: `Basic`
- **Instance Size**: `Basic XXS` ($5/month)
- **Instance Count**: `1`

### **5. Deploy**
- Click **"Create Resources"**
- Wait 5-10 minutes for deployment

## 🎯 **What You Get**
- **Public URL**: `https://your-app-name.ondigitalocean.app`
- **Health Check**: `/health` endpoint
- **Auto-deploy**: Every push to GitHub main branch

## 🔧 **If Build Fails**
1. Check the logs in DigitalOcean dashboard
2. Make sure `/backend` directory contains:
   - `main.py`
   - `requirements.txt`
   - All Python files

## 🌐 **Test Your Deployment**
Visit: `https://your-app-name.ondigitalocean.app/health`

Should show: `{"message":"DriveNow Rentals API","version":"1.0.0","status":"running"}`

