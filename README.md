# 📋 NOTA – SMART NOTE-TAKING APP

<div align="center">

**A full-stack note-taking application with dark mode, checklists, and real-time cloud sync.**

[![Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://mern-note-app-brown.vercel.app)
[![Render](https://img.shields.io/badge/Deployed%20on-Render-46E3B7?style=for-the-badge&logo=render&logoColor=white)](https://nota-backend-6pm4.onrender.com)

</div>

---

## 🚀 Live Demo

| **Frontend** | https://mern-note-app-brown.vercel.app |
| **Backend API** | https://nota-backend-6pm4.onrender.com |

---

## 📖 Overview

**Nota** is a modern, full-stack note-taking application built with the MERN stack (MongoDB, Express.js, React, Node.js). It provides a seamless experience for creating, organizing, and managing your notes with features like dark mode, checklists, and cloud synchronization.

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | Email/Password + Google OAuth 2.0 with JWT |
| 📝 **CRUD Operations** | Create, Read, Update, Delete notes |
| ☑️ **Checklist Support** | Convert any note to a checklist with real-time toggles |
| 🌓 **Dark Mode** | Full dark/light theme with animated toggle |
| 🎨 **Customization** | Per-note colors and fonts |
| 📧 **Email Verification** | 6-digit code verification via Gmail API |
| 🔄 **Password Recovery** | Secure password reset via email |
| 👤 **User Profile** | Update username, password, and avatar |
| 🖼️ **Avatar Upload** | Cloudinary integration for profile pictures |
| 📱 **Responsive** | Optimized for mobile, tablet, and desktop |
| 🔒 **Security** | Rate limiting, JWT, and secure password hashing |

---

## 🛠️ Tech Stack

### Frontend

| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **Tailwind CSS** | Styling and responsive design |
| **React Router v6** | Client-side routing |
| **Axios** | HTTP client for API calls |
| **React Icons** | Icon library |
| **React Hot Toast** | Toast notifications |

### Backend

| Technology | Purpose |
|------------|---------|
| **Node.js** | Runtime environment |
| **Express.js** | Web framework |
| **MongoDB Atlas** | Cloud database |
| **Mongoose** | ODM for MongoDB |
| **JWT** | Authentication tokens |
| **Passport.js** | Google OAuth 2.0 |
| **Gmail API** | Email sending |
| **Cloudinary** | Image upload and storage |

### Deployment

| Service | Purpose |
|---------|---------|
| **Vercel** | Frontend hosting |
| **Render** | Backend hosting |
| **MongoDB Atlas** | Database hosting |

---

## 📂 Project Structure

```
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
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version |
|------|---------|
| **Node.js** | v18.x or higher |
| **npm** | v9.x or higher |
| **MongoDB Atlas** | Cloud account |
| **Git** | Latest version |

### Installation

#### 1️⃣ Clone the repository

```bash
git clone https://github.com/Ceddy21/mern-note-app.git
cd mern-note-app
```

#### 2️⃣ Install Backend Dependencies

```bash
cd backend
npm install
```

#### 3️⃣ Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

#### 4️⃣ Set Up Environment Variables

**Backend (.env)** – Create `backend/.env`:

```env
PORT=5000
MONGODB_URI=mongodb://<username>:<password>@cluster.xxxxx.mongodb.net:27017/noteapp?retryWrites=true&w=majority
JWT_SECRET=8fK!2mP9@xLq7$NwV4!zR1&bT6yHj3*DsE5uC8
JWT_SECRET=YourSuperSecretKey123!@#$%

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:5000/api/auth/google/callback

# Gmail API
GMAIL_CLIENT_ID=your-gmail-client-id.apps.googleusercontent.com
GMAIL_CLIENT_SECRET=your-gmail-client-secret
GMAIL_REFRESH_TOKEN=your-refresh-token

# Cloudinary
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Email (for Gmail API fallback)
EMAIL_FROM=your-email@gmail.com
```

**Frontend (.env)** – Create `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=Nota
```

#### 5️⃣ Start Development Servers

**Terminal 1 – Backend:**

```bash
cd backend
npm run dev
```

**Terminal 2 – Frontend:**

```bash
cd frontend
npm start
```

Your app is now running:

| **Frontend** | http://localhost:3000 |
| **Backend** | http://localhost:5000 |

---

## 📧 Email Setup (Gmail API)

### Step 1: Enable Gmail API

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your project → **APIs & Services** → **Library**
3. Search for **"Gmail API"** → Click **Enable**

### Step 2: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. **Application type:** Desktop app
4. Download `credentials.json`

### Step 3: Get Refresh Token

```bash
cd backend
node get-token.js
```

Follow the prompts to authorize and copy the refresh token.

---

## 🔐 Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. **APIs & Services** → **Credentials** → **OAuth client ID**
3. **Application type:** Web application
4. **Authorized redirect URIs:**

| URI |
|-----|
| `http://localhost:5000/api/auth/google/callback` |
| `https://nota-backend-6pm4.onrender.com/api/auth/google/callback` |

5. **Authorized JavaScript origins:**

| Origin |
|--------|
| `http://localhost:3000` |
| `https://mern-note-app-brown.vercel.app` |

---

## 🖼️ Cloudinary Setup

1. Sign up at [Cloudinary](https://cloudinary.com)
2. Get your credentials from the dashboard:

| Credential | Description |
|------------|-------------|
| **CLOUDINARY_CLOUD_NAME** | Your cloud name |
| **CLOUDINARY_API_KEY** | Your API key |
| **CLOUDINARY_API_SECRET** | Your API secret |

---

## 🚢 Deployment

### Backend (Render)

| Step | Action |
|------|--------|
| 1 | Push code to GitHub |
| 2 | Go to [Render](https://render.com) |
| 3 | **New+** → **Web Service** → Connect GitHub repo |
| 4 | **Root Directory:** `backend` |
| 5 | **Build Command:** `npm install` |
| 6 | **Start Command:** `npm start` |
| 7 | Add environment variables (same as `.env`) |

### Frontend (Vercel)

| Step | Action |
|------|--------|
| 1 | Go to [Vercel](https://vercel.com) |
| 2 | **Add New** → **Project** → Import GitHub repo |
| 3 | **Root Directory:** `frontend` |
| 4 | **Build Command:** `npm run build` |
| 5 | **Output Directory:** `build` |
| 6 | Add environment variables: |

| Variable | Value |
|----------|-------|
| `REACT_APP_API_URL` | `https://your-backend-url.onrender.com/api` |
| `REACT_APP_APP_NAME` | `Nota` |

---

## 🧪 Testing

### Manual Signup Flow

| Step | Action |
|------|--------|
| 1 | Go to `/login` → Click **"Sign Up"** |
| 2 | Fill in username, email, password |
| 3 | You'll be redirected to `/verify-email` |
| 4 | Check your email for the 6-digit code |
| 5 | Enter the code → Email verified ✓ |
| 6 | Login with your credentials |

### API Testing with cURL

**Test email sending:**

```bash
curl -X POST https://nota-backend-6pm4.onrender.com/api/auth/test-email \
  -H "Content-Type: application/json" \
  -d '{"to": "your-email@gmail.com"}'
```

**Test Google login:**

```bash
curl -X GET https://nota-backend-6pm4.onrender.com/api/auth/google
```

---

## 📊 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| **POST** | `/api/auth/signup` | Register new user |
| **POST** | `/api/auth/login` | Login user |
| **POST** | `/api/auth/verify-email` | Verify email with code |
| **POST** | `/api/auth/send-verification` | Resend verification code |
| **POST** | `/api/auth/forgot-password` | Request password reset |
| **POST** | `/api/auth/reset-password` | Reset password with token |
| **GET** | `/api/auth/google` | Google OAuth login |
| **GET** | `/api/auth/me` | Get current user |
| **GET** | `/api/notes` | Get all notes |
| **POST** | `/api/notes` | Create a note |
| **PUT** | `/api/notes/:id` | Update a note |
| **DELETE** | `/api/notes/:id` | Delete a note |
| **PUT** | `/api/users/profile` | Update username |
| **PUT** | `/api/users/password` | Change password |
| **POST** | `/api/users/avatar` | Upload avatar |
| **POST** | `/api/users/delete-request` | Request account deletion |
| **DELETE** | `/api/users/delete-account` | Delete account |

---

## 🛡️ Security Features

| Feature | Implementation |
|---------|----------------|
| **Password Hashing** | bcryptjs |
| **Authentication** | JWT (JSON Web Tokens) |
| **Rate Limiting** | express-rate-limit |
| **CORS** | Configured for frontend URL |
| **Helmet** | Security headers |
| **X-Forwarded-For** | Trust proxy enabled |
| **Input Validation** | Mongoose schema validation |
| **Password Strength** | 8+ chars, uppercase, lowercase, number, special char |

---

## 🤝 Contributing

| Step | Action |
|------|--------|
| 1 | Fork the repository |
| 2 | Create a feature branch (`git checkout -b feature/AmazingFeature`) |
| 3 | Commit your changes (`git commit -m 'Add some AmazingFeature'`) |
| 4 | Push to the branch (`git push origin feature/AmazingFeature`) |
| 5 | Open a Pull Request |

---

## 🙏 Acknowledgments

| Service | Purpose |
|---------|---------|
| [MongoDB Atlas](https://mongodb.com) | Cloud database |
| [Render](https://render.com) | Backend hosting |
| [Vercel](https://vercel.com) | Frontend hosting |
| [Cloudinary](https://cloudinary.com) | Image hosting |
| [Google Cloud](https://cloud.google.com) | OAuth & Gmail API |
| [React Icons](https://react-icons.github.io/react-icons) | Icon library |

---

## 📞 Contact

| Platform | Link |
|----------|------|
| **GitHub** | [@Ceddy21](https://github.com/Ceddy21) |
| **Live Demo** | [Nota App](https://mern-note-app-brown.vercel.app) |

---

<div align="center">

**Built with ❤️ using the MERN Stack**

</div>
