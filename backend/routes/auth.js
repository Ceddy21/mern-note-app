const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const crypto = require('crypto');
const { google } = require('googleapis');

// ─── Gmail API Setup ───
const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  'http://localhost:5000'
);

oAuth2Client.setCredentials({
  refresh_token: process.env.GMAIL_REFRESH_TOKEN,
});

// ─── Email sending function ───
const sendEmail = async (to, subject, htmlContent) => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    
    const messageParts = [
      `From: "Nota" <${process.env.EMAIL_FROM}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      htmlContent,
    ];
    
    const message = messageParts.join('\r\n');
    const encodedMessage = Buffer.from(message)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    const response = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
      },
    });

    console.log('✅ Email sent via Gmail API:', response.data.id);
    return response.data;
  } catch (err) {
    console.error('❌ Gmail API error:', err);
    throw err;
  }
};

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
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// ─── Cooldown helper ───
const checkCooldown = (user) => {
  const cooldownMs = 5 * 60 * 1000;
  if (user.lastVerificationRequestAt) {
    const elapsed = Date.now() - new Date(user.lastVerificationRequestAt).getTime();
    if (elapsed < cooldownMs) {
      const remaining = Math.ceil((cooldownMs - elapsed) / 1000);
      return { blocked: true, remainingSeconds: remaining };
    }
  }
  return { blocked: false };
};

// ─── SIGNUP ───
router.post('/signup', async (req, res) => {
  console.log('📥 Signup request:', { email: req.body.email, username: req.body.username });
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

    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });
    await user.save();

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    user.lastVerificationRequestAt = new Date();
    await user.save();

    try {
      await sendEmail(
        user.email,
        '🔐 Verify Your Account',
        `<h2>Your code: <strong>${code}</strong></h2><p>Valid for 15 minutes.</p>`
      );
    } catch (err) {
      console.error('Email failed:', err.message);
    }

    res.status(201).json({
      message: 'Account created. Please check your email.',
      email: user.email,
    });
  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(400).json({ message: err.message });
  }
});

// ─── Resend Verification ───
router.post('/send-verification', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Already verified' });

    const cooldown = checkCooldown(user);
    if (cooldown.blocked) {
      const minutes = Math.ceil(cooldown.remainingSeconds / 60);
      return res.status(429).json({
        message: `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before requesting a new code.`,
        remainingSeconds: cooldown.remainingSeconds
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    user.lastVerificationRequestAt = new Date();
    await user.save();

    try {
      await sendEmail(
        user.email,
        'Resend Verification Code',
        `<h2>Your new code: <strong>${code}</strong></h2>`
      );
    } catch (err) {
      console.error('Resend email failed:', err.message);
    }

    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('Resend error:', err);
    res.status(500).json({ message: 'Error sending email.' });
  }
});

// ─── Verify Email ───
router.post('/verify-email', async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) return res.status(400).json({ message: 'Email and code required' });

    const user = await User.findOne({
      email: email.toLowerCase(),
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: 'Invalid or expired code' });

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.lastVerificationRequestAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Forgot Password ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.json({ message: 'If an account exists, a reset link has been sent.' });

    const cooldown = checkCooldown(user);
    if (cooldown.blocked) {
      const minutes = Math.ceil(cooldown.remainingSeconds / 60);
      return res.status(429).json({
        message: `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before requesting a new reset link.`,
        remainingSeconds: cooldown.remainingSeconds
      });
    }

    const token = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    user.lastVerificationRequestAt = new Date();
    await user.save();

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    try {
      await sendEmail(
        user.email,
        '🔑 Reset Your Password',
        `<a href="${resetUrl}">Reset Password</a><p>Expires in 1 hour.</p>`
      );
    } catch (err) {
      console.error('Reset email failed:', err.message);
    }

    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending email.' });
  }
});

// ─── Reset Password ───
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) return res.status(400).json({ message: 'Token and password required' });

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
      });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastVerificationRequestAt = undefined;
    await user.save();

    res.json({ message: 'Password reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── Login ───
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(401).json({
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    if (!user.password) return res.status(401).json({ message: 'This account uses Google Sign-In.' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    const token = generateToken(user._id);
    res.json({
      token,
      user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar },
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ─── Google OAuth ───
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
              isVerified: true,
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

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: `${process.env.FRONTEND_URL}/login?error=google_auth_failed` }),
  (req, res) => {
    const token = generateToken(req.user._id);
    res.redirect(`${process.env.FRONTEND_URL}/oauth-redirect?token=${token}`);
  }
);

// ─── Get Current User ───
router.get('/me', async (req, res) => {
  res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token provided' });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

// ─── Test Email Route ───
router.post('/test-email', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: 'Missing "to" email' });
  try {
    await sendEmail(to, '🔧 Debug Test', '<h1>✅ Success!</h1><p>Gmail API is working.</p>');
    res.json({ message: 'Test email sent!' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;