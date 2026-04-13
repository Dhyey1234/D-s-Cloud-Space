# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB running locally or MongoDB Atlas account
- Git

## Quick Setup (5 minutes)

### 1. Backend Setup
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file and add MongoDB connection
echo "PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ds-cloudspace
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d" > .env

# Start the backend server
npm run dev
```

Backend will run on: `http://localhost:5000`

### 2. Frontend Setup (in a new terminal)
```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

Frontend will run on: `http://localhost:3000`

### 3. Test the Application
1. Open `http://localhost:3000` in your browser
2. Click "Get Started" on the landing page
3. Fill in the signup form
4. Upload a file on the home page

## API Endpoints

### Auth
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login

### Files
- `GET /api/files` - List files
- `POST /api/files/upload` - Upload file
- `DELETE /api/files/:id` - Delete file

## Production Build

### Frontend
```bash
cd frontend
npm run build
# Output: dist/ folder ready for deployment
```

### Backend
Set `NODE_ENV=production` in `.env` and deploy with your hosting provider.

## Troubleshooting

- **MongoDB Error**: Make sure MongoDB is running (`mongod` command)
- **Port Already in Use**: Change PORT in backend `.env` or kill the process
- **CORS Error**: Check backend CORS configuration
- **File Upload Not Working**: Check `uploads/` directory permissions
