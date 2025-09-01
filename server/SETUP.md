# WhatsApp Clone Server Setup Guide

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd server
npm install
# or
yarn install
```

### 2. Database Setup
Make sure you have PostgreSQL installed and running.

Create a `.env` file in the server directory:
```env
PORT=3005
DATABASE_URL="postgresql://username:password@localhost:5432/whatsapp_clone"
ZEGO_APP_ID=562073871
ZEGO_SERVER_ID=90f2947f9b32d8d36315cd1f6fb15f96
```

**Replace the DATABASE_URL with your actual PostgreSQL credentials:**
- `username`: Your PostgreSQL username
- `password`: Your PostgreSQL password
- `localhost`: Your database host (usually localhost)
- `5432`: Your PostgreSQL port (default is 5432)
- `whatsapp_clone`: Your database name

### 3. Create Database
```sql
CREATE DATABASE whatsapp_clone;
```

### 4. Push Database Schema
```bash
npx prisma db push
```

### 5. Start Server
```bash
npm start
# or
yarn start
```

## 🔧 Troubleshooting

### Common Issues:

#### 1. Port Already in Use
If you get "Port 3005 is already in use":
```bash
# Find what's using the port
netstat -ano | findstr :3005
# Kill the process
taskkill /PID <PID> /F
```

#### 2. Database Connection Failed
- Make sure PostgreSQL is running
- Check your DATABASE_URL in .env file
- Verify database exists: `CREATE DATABASE whatsapp_clone;`

#### 3. Prisma Errors
```bash
# Reset Prisma
npx prisma generate
npx prisma db push
```

#### 4. Module Not Found Errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
```

## 📱 Test the Server

Once running, test these endpoints:

### Health Check
```
GET http://localhost:3005/health
```

### API Routes
```
POST http://localhost:3005/api/auth/check-user
GET  http://localhost:3005/api/auth/get-contacts
POST http://localhost:3005/api/messages/add-message
```

## 🎯 Server Features

- ✅ Express.js server with CORS
- ✅ Socket.io for real-time messaging
- ✅ Prisma ORM with PostgreSQL
- ✅ File uploads (images, audio, documents)
- ✅ Enhanced chat features (reactions, replies, pinning)
- ✅ Group chat support
- ✅ Voice and video call handling
- ✅ User authentication and profiles

## 📁 File Structure

```
server/
├── controllers/          # Route handlers
├── routes/              # API route definitions
├── utils/               # Utility functions
├── prisma/              # Database schema
├── uploads/             # File uploads
├── index.js             # Main server file
└── package.json         # Dependencies
```

## 🔒 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Server port | 3005 |
| DATABASE_URL | PostgreSQL connection string | Required |
| ZEGO_APP_ID | Zego video call app ID | 562073871 |
| ZEGO_SERVER_ID | Zego server secret | 90f2947f9b32d8d36315cd1f6fb15f96 |

## 🚨 Important Notes

1. **Database**: Must be PostgreSQL (not MySQL or SQLite)
2. **Port**: Make sure port 3005 is available
3. **Firewall**: Allow connections on port 3005
4. **CORS**: Server allows requests from `http://localhost:3000`

## 📞 Support

If you encounter issues:
1. Check the console logs for error messages
2. Verify your database connection
3. Ensure all dependencies are installed
4. Check that the port is not in use
