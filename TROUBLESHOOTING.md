# 🔧 WhatsApp Clone Troubleshooting Guide

## 🚨 **Current Issue: Internal Server Error + Critters Module Error**

### **Problem 1: Critters Module Error (Client Side)**
```
Error: Cannot find module 'critters'
```
**Status:** ✅ **FIXED** - Removed problematic CSS optimization from `next.config.js`

### **Problem 2: Internal Server Error (Server Side)**
**Status:** 🔍 **INVESTIGATING** - Multiple potential causes

---

## 🛠️ **Step-by-Step Fix**

### **Step 1: Fix Client Side (Critters Error)**
The critters error has been fixed by updating `client/next.config.js`. The problematic CSS optimization has been removed.

### **Step 2: Fix Server Side (Internal Server Error)**

#### **Option A: Use the Startup Scripts**
1. **Windows Batch File:** Double-click `start-project.bat`
2. **PowerShell:** Right-click `start-project.ps1` → "Run with PowerShell"

#### **Option B: Manual Startup**

**Start Server First:**
```bash
cd server
npm install
npm start
```

**Start Client Second (in new terminal):**
```bash
cd client
npm install
npm run dev
```

---

## 🔍 **Common Causes & Solutions**

### **1. Database Connection Issues**
```bash
# Check if PostgreSQL is running
# Windows: Check Services app for "PostgreSQL"
# Mac/Linux: sudo systemctl status postgresql

# Create database if it doesn't exist
psql -U postgres
CREATE DATABASE whatsapp_clone;
\q

# Push Prisma schema
cd server
npx prisma db push
```

### **2. Port Already in Use**
```bash
# Check what's using port 3005
netstat -ano | findstr :3005

# Kill the process
taskkill /PID <PID> /F
```

### **3. Missing Dependencies**
```bash
# Server dependencies
cd server
rm -rf node_modules package-lock.json
npm install

# Client dependencies
cd ../client
rm -rf node_modules package-lock.json
npm install
```

### **4. Environment Variables**
Create `.env` file in `server/` directory:
```env
PORT=3005
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_clone"
ZEGO_APP_ID=562073871
ZEGO_SERVER_ID=90f2947f9b32d8d36315cd1f6fb15f96
```

---

## 📋 **Pre-Start Checklist**

- [ ] PostgreSQL is running
- [ ] Database `whatsapp_clone` exists
- [ ] `.env` file is created in `server/` directory
- [ ] Port 3005 is available
- [ ] All dependencies are installed
- [ ] Prisma schema is pushed to database

---

## 🚀 **Quick Start Commands**

### **One-Line Server Start:**
```bash
cd server && npm install && npm start
```

### **One-Line Client Start:**
```bash
cd client && npm install && npm run dev
```

---

## 🔧 **Advanced Troubleshooting**

### **Check Server Logs:**
```bash
cd server
npm start
# Look for specific error messages in console
```

### **Check Client Logs:**
```bash
cd client
npm run dev
# Look for specific error messages in console
```

### **Test Database Connection:**
```bash
cd server
node -e "
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.$connect()
  .then(() => console.log('✅ Database connected'))
  .catch(e => console.error('❌ Database error:', e.message))
  .finally(() => prisma.$disconnect());
"
```

---

## 📱 **Test Endpoints**

Once running, test these:

### **Server Health Check:**
```
GET http://localhost:3005/health
```

### **Client:**
```
http://localhost:3000
```

---

## 🆘 **Still Having Issues?**

### **1. Check Console Output**
- Look for specific error messages
- Note the exact line numbers
- Check for missing modules

### **2. Verify File Structure**
```
project/
├── client/
│   ├── src/
│   ├── package.json
│   └── next.config.js
├── server/
│   ├── routes/
│   ├── controllers/
│   ├── package.json
│   └── index.js
└── README.md
```

### **3. Common Windows Issues**
- PowerShell execution policy: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`
- Antivirus blocking ports
- Windows Firewall blocking connections

### **4. Reset Everything**
```bash
# Remove all generated files
cd client && rm -rf .next node_modules package-lock.json
cd ../server && rm -rf node_modules package-lock.json

# Reinstall everything
cd ../client && npm install
cd ../server && npm install

# Start fresh
cd ../server && npm start
# In new terminal: cd ../client && npm run dev
```

---

## 📞 **Need More Help?**

1. **Check the console output** for specific error messages
2. **Verify your database connection** (PostgreSQL must be running)
3. **Ensure all dependencies are installed**
4. **Check that ports 3000 and 3005 are available**

The most common cause is a **database connection issue** or **missing environment variables**.
