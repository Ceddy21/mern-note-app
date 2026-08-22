# 📋 NOTA – SMART NOTE-TAKING APP

================================================================================

A full-stack note-taking application with dark mode, checklists, and real-time cloud sync.

🌐 **Frontend:** https://mern-note-app-brown.vercel.app
🌐 **Backend API:** https://nota-backend-6pm4.onrender.com

================================================================================

## 📖 OVERVIEW

Nota is a modern, full-stack note-taking application built with the MERN stack 
(MongoDB, Express.js, React, Node.js). It provides a seamless experience for 
creating, organizing, and managing your notes with features like dark mode, 
checklists, and cloud synchronization.

================================================================================

## ✨ KEY FEATURES

┌───────────────────────┬──────────────────────────────────────────────────────┐
│ FEATURE               │ DESCRIPTION                                          │
├───────────────────────┼───────────────────────────────────────────────────── ┤
│ 🔐 Authentication     │ Email/Password + Google OAuth 2.0 with JWT          │
│ 📝 CRUD Operations    │ Create, Read, Update, Delete notes                  │
│ ☑️ Checklist Support  │ Convert any note to a checklist with real-time togg │
│ 🌓 Dark Mode          │ Full dark/light theme with animated toggle          │
│ 🎨 Customization      │ Per-note colors and fonts                           │
│ 📧 Email Verification │ 6-digit code verification via Gmail API             │
│ 🔄 Password Recovery  │ Secure password reset via email                     │
│ 👤 User Profile       │ Update username, password, and avatar               │
│ 🖼️ Avatar Upload     │ Cloudinary integration for profile pictures          │
│ 📱 Responsive         │ Optimized for mobile, tablet, and desktop            │
│ 🔒 Security           │ Rate limiting, JWT, and secure password hashing     │
└───────────────────────┴─────────────────────────────────────────────────────┘

================================================================================

## 🛠️ TECH STACK

┌──────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND                                                                     │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Technology            │ Purpose                                              │
├───────────────────────┼──────────────────────────────────────────────────────┤
│ React 18              │ UI framework                                         │
│ Tailwind CSS          │ Styling and responsive design                        │
│ React Router v6       │ Client-side routing                                  │
│ Axios                 │ HTTP client for API calls                            │
│ React Icons           │ Icon library                                         │
│ React Hot Toast       │ Toast notifications                                  │
└───────────────────────┴──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ BACKEND                                                                      │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Technology            │ Purpose                                              │
├───────────────────────┼──────────────────────────────────────────────────────┤
│ Node.js               │ Runtime environment                                  │
│ Express.js            │ Web framework                                        │
│ MongoDB Atlas         │ Cloud database                                       │
│ Mongoose              │ ODM for MongoDB                                      │
│ JWT                   │ Authentication tokens                                │
│ Passport.js           │ Google OAuth 2.0                                     │
│ Gmail API             │ Email sending                                        │
│ Cloudinary            │ Image upload and storage                             │
└───────────────────────┴──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────────────┐
│ DEPLOYMENT                                                                   │
├───────────────────────┬──────────────────────────────────────────────────────┤
│ Service               │ Purpose                                              │
├───────────────────────┼──────────────────────────────────────────────────────┤
│ Vercel                │ Frontend hosting                                     │
│ Render                │ Backend hosting                                      │
│ MongoDB Atlas         │ Database hosting                                     │
└───────────────────────┴──────────────────────────────────────────────────────┘

================================================================================

## 📂 PROJECT STRUCTURE

mern-note-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Note.js               # Note schema
│   ├── routes/
│   │   ├── auth.js               # Authentication routes
│   │   ├── notes.js              # Note CRUD routes
│   │   └── users.js              # User profile routes
│   ├── middleware/
│   │   └── auth.js               # JWT verification middleware
│   ├── server.js                 # Entry point
│   └── .env                      # Environment variables
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── Header.jsx
    │   │   ├── NoteList.jsx
    │   │   ├── NoteCard.jsx
    │   │   ├── NoteEditor.jsx
    │   │   ├── Login.jsx
    │   │   ├── Profile.jsx
    │   │   ├── VerifyEmail.jsx
    │   │   ├── ForgotPassword.jsx
    │   │   ├── ResetPassword.jsx
    │   │   └── ConfirmModal.jsx
    │   ├── context/
    │   │   ├── AuthContext.jsx    # Authentication state
    │   │   └── ThemeContext.jsx   # Dark mode state
    │   ├── hooks/
    │   │   └── useNotes.js        # Notes CRUD operations
    │   ├── styles/
    │   │   └── index.css          # Tailwind + custom styles
    │   ├── App.jsx
    │   ├── api.js                 # Axios instance
    │   └── index.js
    ├── package.json
    └── tailwind.config.js

================================================================================

## 🚀 GETTING STARTED

┌───────────────────────────────────────────────────────────────────────────────┐
│ PREREQUISITES                                                                 │
├───────────────────────┬────────────────────────────────────────────────────── ┤
│ Tool                  │ Version                                               │
├───────────────────────┼────────────────────────────────────────────────────── ┤
│ Node.js               │ v18.x or higher                                       │
│ npm                   │ v9.x or higher                                        │
│ MongoDB Atlas         │ Cloud account                                         │
│ Git                   │ Latest version                                        │
└───────────────────────┴────────────────────────────────────────────────────── ┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ INSTALLATION                                                                  │
└───────────────────────────────────────────────────────────────────────────────┘

**1️⃣ CLONE THE REPOSITORY**

   git clone https://github.com/Ceddy21/mern-note-app.git
   cd mern-note-app

**2️⃣ INSTALL BACKEND DEPENDENCIES**

   cd backend
   npm install

**3️⃣ INSTALL FRONTEND DEPENDENCIES**

   cd ../frontend
   npm install

**4️⃣ SET UP ENVIRONMENT VARIABLES**

   ┌───────────────────────────────────────────────────────────────────────────┐
   │ BACKEND (.env) – Create backend/.env                                      │
   ├───────────────────────────────────────────────────────────────────────────┤
   │ PORT=5000                                                                 │
   │ MONGODB_URI=mongodb+srv://<username>:<password>@cluster.xxxxx.mongodb.    │
   │ net/noteapp?retryWrites=true&w=majority                                   │
   │ JWT_SECRET=YourSuperSecretKey123!@#$%                                     │
   │                                                                           │
   │ # Google OAuth                                                            │
   │ GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com                │
   │ GOOGLE_CLIENT_SECRET=your-client-secret                                   │
   │ GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback        │
   │                                                                           │
   │ # Gmail API                                                               │
   │ GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com           │
   │ GMAIL_CLIENT_SECRET=your-gmail-client-secret                              │
   │ GMAIL_REFRESH_TOKEN=your-refresh-token                                    │
   │                                                                           │
   │ # Cloudinary                                                              │
   │ CLOUDINARY_CLOUD_NAME=your-cloud-name                                     │
   │ CLOUDINARY_API_KEY=your-api-key                                           │
   │ CLOUDINARY_API_SECRET=your-api-secret                                     │
   │                                                                           │
   │ # Frontend URL                                                            │
   │ FRONTEND_URL=http://localhost:3000                                        │
   │                                                                           │
   │ # Email (for Gmail API fallback)                                          │
   │ EMAIL_FROM=your-email@gmail.com                                           │
   └───────────────────────────────────────────────────────────────────────────┘

   ┌───────────────────────────────────────────────────────────────────────────┐
   │ FRONTEND (.env) – Create frontend/.env                                    │
   ├───────────────────────────────────────────────────────────────────────────┤
   │ REACT_APP_API_URL=http://localhost:5000/api                               │
   │ REACT_APP_APP_NAME=Nota                                                   │
   └───────────────────────────────────────────────────────────────────────────┘

**5️⃣ START DEVELOPMENT SERVERS**

   TERMINAL 1 – BACKEND:
   cd backend
   npm run dev

   TERMINAL 2 – FRONTEND:
   cd frontend
   npm start

   ┌───────────────────────────────────────────────────────────────────────────┐
   │ Your app is now running:                                                  │
   │                                                                           │
   │ 🖥️ Frontend: http://localhost:3000                                       │
   │ 🖥️ Backend:  http://localhost:5000                                       │
   └───────────────────────────────────────────────────────────────────────────┘

================================================================================

## 📧 EMAIL SETUP (GMAIL API)

┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 1: ENABLE GMAIL API                                                      │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Go to https://console.cloud.google.com                                     │
│ 2. Select your project → APIs & Services → Library                            │
│ 3. Search for "Gmail API" → Click Enable                                      │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 2: CREATE OAUTH CREDENTIALS                                              │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Go to APIs & Services → Credentials                                        │
│ 2. Click + CREATE CREDENTIALS → OAuth client ID                               │
│ 3. Application type: Desktop app                                              │
│ 4. Download credentials.json                                                  │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ STEP 3: GET REFRESH TOKEN                                                     │
├───────────────────────────────────────────────────────────────────────────────┤
│ cd backend                                                                    │
│ node get-token.js                                                             │
│                                                                               │
│ Follow the prompts to authorize and copy the refresh token.                   │
└───────────────────────────────────────────────────────────────────────────────┘

================================================================================

## 🔐 GOOGLE OAUTH SETUP

┌───────────────────────────────────────────────────────────────────────────────┐
│ 1. Go to https://console.cloud.google.com                                     │
│ 2. APIs & Services → Credentials → OAuth client ID                            │
│ 3. Application type: Web application                                          │
│ 4. Authorized redirect URIs:                                                  │
│                                                                               │
│    http://localhost:5000/api/auth/google/callback                             │
│    https://nota-backend-6pm4.onrender.com/api/auth/google/callback            │
│                                                                               │
│ 5. Authorized JavaScript origins:                                             │
│                                                                               │
│    http://localhost:3000                                                      │
│    https://mern-note-app-brown.vercel.app                                     │
└───────────────────────────────────────────────────────────────────────────────┘

================================================================================

## 🖼️ CLOUDINARY SETUP

┌───────────────────────────────────────────────────────────────────────────────┐
│ 1. Sign up at https://cloudinary.com                                          │
│ 2. Get your credentials from the dashboard:                                   │
│                                                                               │
│    - CLOUDINARY_CLOUD_NAME                                                    │
│    - CLOUDINARY_API_KEY                                                       │
│    - CLOUDINARY_API_SECRET                                                    │
└───────────────────────────────────────────────────────────────────────────────┘

================================================================================

## 🚢 DEPLOYMENT

┌───────────────────────────────────────────────────────────────────────────────┐
│ BACKEND (RENDER)                                                              │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Push code to GitHub                                                        │
│ 2. Go to https://render.com                                                   │
│ 3. New+ → Web Service → Connect GitHub repo                                   │
│ 4. Root Directory: backend                                                    │
│ 5. Build Command: npm install                                                 │
│ 6. Start Command: npm start                                                   │
│ 7. Add environment variables (same as .env)                                   │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ FRONTEND (VERCEL)                                                             │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Go to https://vercel.com                                                   │
│ 2. Add New → Project → Import GitHub repo                                     │ 
│ 3. Root Directory: frontend                                                   │
│ 4. Build Command: npm run build                                               │
│ 5. Output Directory: build                                                    │
│ 6. Add environment variables:                                                 │
│                                                                               │
│    REACT_APP_API_URL=https://your-backend-url.onrender.com/api                │
│    REACT_APP_APP_NAME=Nota                                                    │
└───────────────────────────────────────────────────────────────────────────────┘

================================================================================

## 🧪 TESTING

┌───────────────────────────────────────────────────────────────────────────────┐
│ MANUAL SIGNUP FLOW                                                            │
├───────────────────────────────────────────────────────────────────────────────┤
│ 1. Go to /login → Click "Sign Up"                                             │
│ 2. Fill in username, email, password                                          │
│ 3. You'll be redirected to /verify-email                                      │
│ 4. Check your email for the 6-digit code                                      │
│ 5. Enter the code → Email verified ✓                                          │
│ 6. Login with your credentials                                                │
└───────────────────────────────────────────────────────────────────────────────┘

┌───────────────────────────────────────────────────────────────────────────────┐
│ API TESTING WITH CURL                                                         │
├───────────────────────────────────────────────────────────────────────────────┤
│ # Test email sending                                                          │
│ curl -X POST https://nota-backend-6pm4.onrender.com/api/auth/test-email \     │
│   -H "Content-Type: application/json" \                                       │
│   -d '{"to": "your-email@gmail.com"}'                                         │
│                                                                               │
│ # Test Google login                                                           │
│ curl -X GET https://nota-backend-6pm4.onrender.com/api/auth/google            │
└───────────────────────────────────────────────────────────────────────────────┘

================================================================================

## 📊 API ENDPOINTS

┌──────────┬────────────────────────────────┬──────────────────────────────────┐
│ METHOD   │ ENDPOINT                       │ DESCRIPTION                      │
├──────────┼────────────────────────────────┼──────────────────────────────────┤
│ POST     │ /api/auth/signup               │ Register new user                │
│ POST     │ /api/auth/login                │ Login user                       │
│ POST     │ /api/auth/verify-email         │ Verify email with code           │
│ POST     │ /api/auth/send-verification    │ Resend verification code         │
│ POST     │ /api/auth/forgot-password      │ Request password reset           │
│ POST     │ /api/auth/reset-password       │ Reset password with token        │
│ GET      │ /api/auth/google               │ Google OAuth login               │
│ GET      │ /api/auth/me                   │ Get current user                 │
│ GET      │ /api/notes                     │ Get all notes                    │
│ POST     │ /api/notes                     │ Create a note                    │
│ PUT      │ /api/notes/:id                 │ Update a note                    │
│ DELETE   │ /api/notes/:id                 │ Delete a note                    │
│ PUT      │ /api/users/profile             │ Update username                  │
│ PUT      │ /api/users/password            │ Change password                  │
│ POST     │ /api/users/avatar              │ Upload avatar                    │
│ POST     │ /api/users/delete-request      │ Request account deletion         │
│ DELETE   │ /api/users/delete-account      │ Delete account                   │
└──────────┴────────────────────────────────┴──────────────────────────────────┘

================================================================================

## 🛡️ SECURITY FEATURES

┌───────────────────────────┬──────────────────────────────────────────────────┐
│ FEATURE                   │ IMPLEMENTATION                                   │
├───────────────────────────┼──────────────────────────────────────────────────┤
│ Password Hashing          │ bcryptjs                                         │
│ Authentication            │ JWT (JSON Web Tokens)                            │
│ Rate Limiting             │ express-rate-limit                               │
│ CORS                      │ Configured for frontend URL                      │
│ Helmet                    │ Security headers                                 │
│ X-Forwarded-For           │ Trust proxy enabled                              │
│ Input Validation          │ Mongoose schema validation                       │
│ Password Strength         │ 8+ chars, uppercase, lowercase, number,          │
│                           │ special character                                │
└───────────────────────────┴──────────────────────────────────────────────────┘

================================================================================

## 🤝 CONTRIBUTING

   1. Fork the repository
   2. Create a feature branch (git checkout -b feature/AmazingFeature)
   3. Commit your changes (git commit -m 'Add some AmazingFeature')
   4. Push to the branch (git push origin feature/AmazingFeature)
   5. Open a Pull Request

================================================================================

## 🙏 ACKNOWLEDGMENTS

┌───────────────────────────┬──────────────────────────────────────────────────┐
│ SERVICE                   │ PURPOSE                                          │
├───────────────────────────┼──────────────────────────────────────────────────┤
│ MongoDB Atlas             │ Cloud database                                   │
│ Render                    │ Backend hosting                                  │
│ Vercel                    │ Frontend hosting                                 │
│ Cloudinary                │ Image hosting                                    │
│ Google Cloud              │ OAuth & Gmail API                                │
│ React Icons               │ Icon library                                     │
└───────────────────────────┴──────────────────────────────────────────────────┘

================================================================================

## 📞 CONTACT

┌───────────────────────────┬──────────────────────────────────────────────────┐
│ PLATFORM                  │ LINK                                             │
├───────────────────────────┼──────────────────────────────────────────────────┤
│ GitHub                    │ @Ceddy21                                         │
│ Live Demo                 │ https://mern-note-app-brown.vercel.app           │
└───────────────────────────┴──────────────────────────────────────────────────┘

================================================================================

                       Built with using the MERN Stack

================================================================================
