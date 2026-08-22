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

const sendEmail = async (to, subject, htmlContent, textContent = '') => {
  try {
    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });
    const emailParts = [
      `From: "Nota" <${process.env.EMAIL_FROM}>`,
      `To: ${to}`,
      `Subject: ${subject}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      '',
      htmlContent,
    ];
    
    const message = emailParts.join('\r\n');
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

    console.log('Email sent via Gmail API:', response.data.id);
    return response.data;
  } catch (err) {
    console.error('Gmail API error:', err);
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
  console.log('Signup request:', { email: req.body.email, username: req.body.username });
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
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f9fafc; }
            .header { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
            .header h1 { color: #3b82f6; margin: 0; }
            .code-box { background: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #3b82f6; }
            .code { font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 6px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nota</h1>
              <p style="color: #6b7280;">Your smart note-taking companion</p>
            </div>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thanks for signing up for <strong>Nota</strong>! We're excited to help you stay organized.</p>
            <p>To complete your registration, please use the verification code below:</p>
            <div class="code-box">
              <span class="code">${code}</span>
            </div>
            <p>This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            <p>Once verified, you'll be able to create notes, set reminders, and sync across all your devices.</p>
            <div class="footer">
              <p>Nota – Your notes, everywhere.</p>
              <p><a href="https://mern-note-app-brown.vercel.app/unsubscribe" style="color: #3b82f6;">Unsubscribe</a> (you won't receive marketing emails)</p>
            </div>
          </div>
        </body>
        </html>
      `;
      const textContent = `
        Nota – Verify Your Email

        Hello ${username},

        Thanks for signing up for Nota! We're excited to help you stay organized.

        Your verification code is: ${code}

        This code expires in 15 minutes. If you didn't request this, you can safely ignore this email.

        Once verified, you'll be able to create notes, set reminders, and sync across all your devices.

        - The Nota Team
      `;
      await sendEmail(user.email, 'Verify Your Email - Nota', htmlContent, textContent);
    } catch (err) {
      console.error('Email failed:', err.message);
    }

    res.status(201).json({
      message: 'Account created. Please check your email for verification code.',
      email: user.email,
    });
  } catch (err) {
    console.error('Signup error:', err);
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
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f9fafc; }
            .header { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
            .header img { max-width: 120px; height: auto; }
            .code-box { background: #ffffff; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; border: 1px dashed #3b82f6; }
            .code { font-size: 36px; font-weight: bold; color: #1e293b; letter-spacing: 6px; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <img src="https://res.cloudinary.com/sqlrnnth/image/upload/v1787311243/Nota_logo_nobg.png" alt="Nota Logo" />
              <p style="color: #6b7280;">Your note taking companion</p>
            </div>
            <p>Hello <strong>${username}</strong>,</p>
            <p>Thanks for signing up for <strong>Nota</strong>! We're excited to help you stay organized.</p>
            <p>To complete your registration, please use the verification code below:</p>
            <div class="code-box">
              <span class="code">${code}</span>
            </div>
            <p>This code expires in <strong>15 minutes</strong>. If you didn't request this, you can safely ignore this email.</p>
            <p>Once verified, you'll be able to create notes, set reminders, and sync across all your devices.</p>
            <div class="footer">
              <p>Nota – Your notes, everywhere.</p>
              <p><a href="https://mern-note-app-brown.vercel.app/unsubscribe" style="color: #3b82f6;">Unsubscribe</a> (you won't receive marketing emails)</p>
            </div>
          </div>
        </body>
        </html>
      `;
      await sendEmail(user.email, 'Resend Verification Code - Nota', htmlContent);
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
      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 550px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; background: #f9fafc; }
            .header { text-align: center; padding-bottom: 10px; border-bottom: 2px solid #3b82f6; }
            .header h1 { color: #3b82f6; margin: 0; }
            .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; }
            .footer { margin-top: 20px; font-size: 12px; color: #999; text-align: center; border-top: 1px solid #e0e0e0; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Nota Password Reset</h1>
            </div>
            <p>Hello <strong>${user.username}</strong>,</p>
            <p>We received a request to reset your password. Click the button below to create a new one:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${resetUrl}" class="button">Reset Password</a>
            </div>
            <p>This link expires in <strong>1 hour</strong>. If you didn't request this, please ignore this email.</p>
            <div class="footer">
              <p>Nota – Your notes, everywhere.</p>
              <p><a href="https://mern-note-app-brown.vercel.app/unsubscribe" style="color: #3b82f6;">Unsubscribe</a></p>
            </div>
          </div>
        </body>
        </html>
      `;
      await sendEmail(user.email, 'Reset Your Password - Nota', htmlContent);
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
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 10px; }
          h1 { color: #3b82f6; }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>Email Test Successful</h1>
          <p>Your Gmail API is working perfectly.</p>
          <p>– The Nota Team</p>
        </div>
      </body>
      </html>
    `;
    await sendEmail(to, 'Test Email - Nota', htmlContent);
    res.json({ message: 'Test email sent!' });
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;