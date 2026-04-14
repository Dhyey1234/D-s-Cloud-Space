# D's Cloud Space

A modern cloud storage application with a beautiful animated landing page, secure user authentication, and file management capabilities.

## Features

- 🎨 **Stunning Landing Page** - Animated 3D background with ColorBends shader visualization
- 🔐 **Secure Authentication** - User signup and login with JWT tokens and password hashing
- 📁 **File Management** - Upload, view, and delete files securely
- 🚀 **Modern Stack** - React + Vite frontend, Express.js + MongoDB backend
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast Performance** - Optimized with Vite and high-performance rendering

## Project Structure

```
ds-cloudspace/
├── frontend/                 # React + Vite application
│   ├── src/
│   │   ├── components/      # Reusable React components
│   │   │   └── ColorBends.jsx
│   │   ├── pages/           # Page components
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignupPage.jsx
│   │   │   └── HomePage.jsx
│   │   ├── styles/          # CSS files
│   │   ├── App.jsx          # Main app component with routing
│   │   └── main.jsx         # Entry point
│   └── package.json
└── backend/                 # Express.js + MongoDB application
    ├── src/
    │   ├── models/          # Database models
    │   │   ├── User.js
    │   │   └── File.js
    │   ├── routes/          # API routes
    │   │   ├── authRoutes.js
    │   │   └── files.js
    │   ├── middleware/      # Middleware functions
    │   │   └── auth.js
    │   └── server.js        # Express server setup
    └── package.json
```

## Requirements

- Node.js (v16 or higher)
- MongoDB (local or cloud instance like MongoDB Atlas)
- npm or yarn

## Installation

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env.local` file (optional, for environment variables):
```bash
VITE_API_URL=http://localhost:5000
```

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your MongoDB connection string, JWT secret, and email settings:
```env
PORT=8000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/ds-cloudspace
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRE=7d
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=your-smtp-user
EMAIL_PASS=your-smtp-password
EMAIL_FROM="D's Cloud Space" <no-reply@example.com>
CLIENT_URL=http://localhost:3000
```

If SMTP is not configured, password reset emails will be logged to the server console for development.

## Running the Application

### Start the Backend Server

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:5000`

### Start the Frontend Development Server

In a new terminal:

```bash
cd frontend
npm run dev
```

The frontend will start on `http://localhost:3000`

## Available Routes

### Frontend Routes
- `/` - Landing page
- `/signup` - Sign up page
- `/login` - Login page
- `/forgot-password` - Forgot password page
- `/reset-password/:resetToken` - Reset password page
- `/home` - Home page (protected route after login)
- `/organizations` - Organizations management page (protected)
- `/org/:orgId` - Organization settings page (protected)
- `/accept-invite/:token` - Accept organization invite

### Backend API Routes

#### Authentication (`/api/auth`)
- `POST /signup` - Create a new user account
- `POST /login` - Login with email and password
- `POST /forgot-password` - Send password reset instructions by email
- `PUT /reset-password/:resetToken` - Reset password using the emailed reset token

#### Organizations (`/api/orgs`) - Multi-Organization Management
- `GET /` - Get all organizations for current user (protected)
- `POST /` - Create a new organization (protected)
- `GET /:orgId` - Get organization details (protected)
- `PUT /:orgId` - Update organization profile: name, description, logo (protected, admin+)
- `POST /:orgId/switch` - Switch to an organization (protected)
- `GET /:orgId/storage` - Get organization storage usage (protected)
- `GET /:orgId/policies` - Get organization policies (protected)
- `PUT /:orgId/policies` - Update organization policies (protected, admin+)
- `GET /:orgId/members` - Get organization members (protected)
- `POST /:orgId/invite` - Invite member via email (protected, admin+)
- `POST /invite/:token/accept` - Accept organization invite (protected)
- `PUT /:orgId/members/:memberId/role` - Update member role (protected, admin+)
- `POST /:orgId/members/:memberId/suspend` - Suspend member (protected, admin+)
- `DELETE /:orgId/members/:memberId` - Remove member (protected, admin+)
- `POST /:orgId/transfer-ownership` - Transfer organization ownership (protected, owner)

#### Files (`/api/files`)
- `GET /` - Get all user's files (protected)
- `POST /upload` - Upload a new file (protected)
- `DELETE /:id` - Delete a file (protected)

## Organization Management Features

### Architecture
- **Multi-Organization Support**: Users can create and belong to multiple organizations
- **Role-Based Access Control**: Owner, Admin, Member, Viewer roles with granular permissions
- **Isolated Environments**: Each organization has separate file storage, members, and policies
- **Email-Based Invitations**: 7-day expiration tokens with automatic cleanup

### Organization Roles & Permissions
| Feature | Owner | Admin | Member | Viewer |
|---------|-------|-------|--------|--------|
| View files | ✅ | ✅ | ✅ | ✅ |
| Upload files | ✅ | ✅ | ✅ | ❌ |
| Delete files | ✅ | ✅ | ✅ | ❌ |
| Edit org settings | ✅ | ✅ | ❌ | ❌ |
| Manage members | ✅ | ✅ | ❌ | ❌ |
| Suspend members | ✅ | ✅ | ❌ | ❌ |
| Transfer ownership | ✅ | ❌ | ❌ | ❌ |

### Member Management
- Invite members via email with role assignment
- Accept/reject invitations via email link
- Update member roles
- Suspend members (retain data, deny access)
- Remove members permanently

### Organization Policies
- Two-factor authentication requirements
- Public file sharing controls
- Download permissions
- Max file size enforcement
- Storage quota management

## Building for Production

### Frontend Build

```bash
cd frontend
npm run build
```

This creates an optimized production build in the `dist` folder.

### Backend Deployment

Update your `.env` file with production values and deploy to a hosting service like:
- Heroku
- Railway
- Render
- AWS
- DigitalOcean

## Features Overview

### Landing Page
- Beautiful animated 3D background using THREE.js and custom shaders
- Call-to-action buttons for signup and login
- Feature cards highlighting key benefits
- Fully responsive design

### Authentication
- Email and password-based authentication
- Password hashing with bcryptjs
- JWT token generation for secure sessions
- Form validation on both frontend and backend

### File Management
- Upload files (max 10MB)
- View all uploaded files with metadata
- Delete files securely
- File ownership verification

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT token-based authentication
- ✅ Protected routes requiring authentication
- ✅ CORS configuration
- ✅ Input validation on both frontend and backend
- ✅ User-specific file access control

## Environment Variables

### Frontend
No required environment variables, but optional:
- `VITE_API_URL` - Backend API URL (defaults to `/api`)

### Backend
Required:
- `PORT` - Server port (default: 5000)
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret key for JWT signing
- `JWT_EXPIRE` - Token expiration time (default: 7d)
- `NODE_ENV` - Environment (development/production)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running locally or cloud instance is accessible
- Check the connection string in `.env`
- Verify firewall and network settings

### Frontend API Connection Issues
- Ensure backend server is running on the correct port
- Check CORS configuration in `backend/src/server.js`
- Verify the API proxy settings in `frontend/vite.config.js`

### File Upload Issues
- Check available disk space
- Verify file size is under 10MB limit
- Ensure `uploads` directory has write permissions

## Development Tips

- Frontend and backend run on separate ports during development
- The frontend proxy is configured in `vite.config.js` to forward `/api` requests to the backend
- Use browser DevTools Network tab to debug API calls
- Check browser console for frontend errors and server logs for backend errors

## Future Enhancements

- [ ] File sharing with public links
- [ ] File versioning and restore functionality
- [ ] Advanced search and filtering
- [ ] User profile management
- [ ] Two-factor authentication
- [ ] File encryption
- [ ] Collaborative features
- [ ] Mobile app

## License

This project is open source and available under the MIT License.

## Support

For issues, questions, or suggestions, please open an issue in the repository.
