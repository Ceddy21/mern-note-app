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
let transporter;
try {
  // Log environment variables (mask password)
  console.log('📧 EMAIL_HOST:', process.env.EMAIL_HOST);
  console.log('📧 EMAIL_PORT:', process.env.EMAIL_PORT);
  console.log('📧 EMAIL_SECURE:', process.env.EMAIL_SECURE);
  console.log('📧 EMAIL_USER:', process.env.EMAIL_USER);
  console.log('📧 EMAIL_FROM:', process.env.EMAIL_FROM);
  console.log('📧 EMAIL_PASS exists:', !!process.env.EMAIL_PASS);

  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    family: 4, // ✅ Force IPv4
    connectionTimeout: 30000,
    greetingTimeout: 30000,
    socketTimeout: 60000,
    tls: { rejectUnauthorized: false },
    debug: true, // Enable SMTP debug logs
    logger: true,
  });

  console.log('✅ Transporter created successfully');
} catch (err) {
  console.error('❌ Transporter creation error:', err);
  transporter = null;
}

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
    if (existingUser) {
      console.log('❌ User already exists');
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
    console.log('✅ User saved');

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    user.lastVerificationRequestAt = new Date();
    await user.save();
    console.log('✅ Verification code generated');

    // ── Send email with retry ──
    if (transporter) {
      let attempts = 0;
      let success = false;
      while (attempts < 3 && !success) {
        attempts++;
        try {
          console.log(`📧 Attempt ${attempts} sending to ${user.email}`);
          const info = await transporter.sendMail({
            to: user.email,
            from: `"Nota" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            subject: '🔐 Verify Your Account',
            text: `Your code: ${code}`,
            html: `<h2>Your code: <strong>${code}</strong></h2><p>Valid for 15 minutes.</p>`,
          });
          console.log('✅ Email sent:', info.messageId);
          success = true;
        } catch (err) {
          console.error(`❌ Attempt ${attempts} error:`, err.message);
          if (attempts < 3) await new Promise(r => setTimeout(r, 2000));
        }
      }
    } else {
      console.error('❌ Transporter is null');
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

    if (transporter) {
      let attempts = 0;
      let success = false;
      while (attempts < 3 && !success) {
        attempts++;
        try {
          await transporter.sendMail({
            to: user.email,
            from: `"Nota" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
            subject: '🔐 Resend Verification',
            text: `Your new code: ${code}`,
            html: `<h2>Your new code: <strong>${code}</strong></h2>`,
          });
          success = true;
        } catch (err) {
          console.error(`❌ Resend attempt ${attempts} error:`, err.message);
          if (attempts < 3) await new Promise(r => setTimeout(r, 2000));
        }
      }
    }

    res.json({ message: 'Verification code sent.' });
  } catch (err) {
    console.error('❌ Resend error:', err);
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

// ─── FORGOT PASSWORD ─── (shortened for space – kept functional)
router.post('/forgot-password', async (req, res) => {
  // ... (same as earlier, we'll keep it concise)
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
    if (transporter) {
      transporter.sendMail({
        to: user.email,
        from: `"Nota" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        subject: '🔑 Reset Password',
        text: `Click: ${resetUrl}\n\nExpires in 1 hour.`,
        html: `<a href="${resetUrl}">Reset Password</a><p>Expires in 1 hour.</p>`,
      }).catch(err => console.error('❌ Reset email error:', err));
    }
    res.json({ message: 'If an account exists, a reset link has been sent.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── RESET PASSWORD ─── (shortened)
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

// ─── LOGIN ───
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

// ─── GOOGLE OAUTH ───
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

// ─── GET CURRENT USER ───
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

// ─── TEST EMAIL ROUTE ───
router.post('/test-email', async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ message: 'Missing "to" email' });

  console.log(`📧 Test email requested for: ${to}`);

  if (!transporter) {
    console.error('❌ Transporter is null');
    return res.status(500).json({ message: 'Email transporter not configured' });
  }

  try {
    const info = await transporter.sendMail({
      to: to,
      from: `"Nota Debug" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
      subject: '🔧 Debug Test Email',
      text: 'If you receive this, email is working.',
      html: '<h1>✅ Debug Test</h1><p>Your email config is correct.</p>',
    });
    console.log('✅ Test email sent:', info.messageId);
    res.json({ message: 'Test email sent!', messageId: info.messageId });
  } catch (err) {
    console.error('❌ Test email error:', err);
    res.status(500).json({ error: err.message, stack: err.stack });
  }
});

module.exports = router;