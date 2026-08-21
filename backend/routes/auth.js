const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─── Password Helper ───
const isPasswordStrong = (password) => {
  if (password.length < 8) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  if (!/[!@#$%^&*_]/.test(password)) return false;
  return true;
};

// ─── Generate JWT Token ───
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// ─── Email Transporter ───
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ─── SIGNUP ───
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isPasswordStrong(password)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
      });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });
    await user.save();

    // ── Send verification code ──
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: `"App Name" <${process.env.EMAIL_FROM || 'noreply@yourapp.com'}>`,
      subject: 'Verify Your Email',
      html: `
        <h1>Welcome to App Name!</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 4px; background: #f0f0f0; padding: 10px 20px; display: inline-block;">${code}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't sign up, please ignore this email.</p>
      `,
    });

    res.status(201).json({
      message: 'Account created. Please check your email for verification code.',
      email: user.email,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── LOGIN ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in. Check your inbox for the verification code.',
        needsVerification: true,
        email: user.email,
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: 'This account uses Google Sign-In. Please use Google login.',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user._id);

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── GOOGLE OAUTH SETUP ───
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (!user) {
          user = await User.findOne({ email: profile.emails[0].value });

          if (user) {
            user.googleId = profile.id;
            user.avatar = profile.photos[0]?.value || user.avatar;
            await user.save();
          } else {
            user = new User({
              username: profile.displayName || profile.emails[0].value.split('@')[0],
              email: profile.emails[0].value,
              googleId: profile.id,
              avatar: profile.photos[0]?.value,
            });
            await user.save();
          }
        }

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

// ─── GOOGLE LOGIN ROUTES ───
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(
      `${process.env.FRONTEND_URL}/oauth-redirect?token=${token}`
    );
  }
);

// ─── GET CURRENT USER ───
router.get('/me', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ─── FORGOT PASSWORD ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      // For security, don't reveal if email exists or not
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send email
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    const emailHtml = `
      <h1>Password Reset</h1>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#3b82f6; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
      <p>If you did not request this, please ignore this email.</p>
      <p>This link will expire in 1 hour.</p>
    `;

    await transporter.sendMail({
      to: user.email,
      from: `"App Name" <${process.env.EMAIL_FROM || 'noreply@yourapp.com'}>`,
      subject: 'Password Reset',
      html: emailHtml,
    });

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending email. Please try again later.' });
  }
});

// ─── RESET PASSWORD ───
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    // Validate password strength
    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.isVerified) {
      return res.status(400).json({ message: 'Email already verified' });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: `"App Name" <${process.env.EMAIL_FROM || 'noreply@yourapp.com'}>`,
      subject: 'Email Verification',
      html: `
        <h1>Verify Your Email</h1>
        <p>Your verification code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 4px; background: #f0f0f0; padding: 10px 20px; display: inline-block;">${code}</h2>
        <p>This code will expire in 15 minutes.</p>
        <p>If you didn't sign up for an account, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Verification code sent to your email.' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error sending verification email.' });
  }
});

router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ message: 'Email and code are required' });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;