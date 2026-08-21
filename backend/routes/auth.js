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
  transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
  console.log('✅ Email transporter configured');
} catch (err) {
  console.warn('⚠️ Email transporter not configured:', err.message);
  transporter = null;
}

// ─── Cooldown helper ───
const checkCooldown = (user) => {
  const cooldownMs = 5 * 60 * 1000; // 5 minutes
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
  console.log('📥 Signup request received:', { 
    email: req.body.email, 
    username: req.body.username,
    hasPassword: !!req.body.password 
  });
  
  try {
    const { username, email, password } = req.body;

    // ── Validate input ──
    if (!username || !email || !password) {
      console.log('❌ Missing fields');
      return res.status(400).json({ message: 'All fields are required' });
    }

    if (!isPasswordStrong(password)) {
      console.log('❌ Weak password');
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
      });
    }

    // ── Check if user exists ──
    const existingUser = await User.findOne({ $or: [{ email: email.toLowerCase() }, { username }] });
    
    if (existingUser) {
      console.log('❌ User already exists:', existingUser.email);
      return res.status(400).json({ message: 'User already exists' });
    }

    // ── Hash password and create user ──
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: false,
    });

    console.log('💾 Saving user to MongoDB...');
    await user.save();
    console.log('✅ User saved successfully, ID:', user._id);

    // ── Generate verification code ──
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    user.lastVerificationRequestAt = new Date();
    await user.save();
    console.log('✅ Verification code generated for:', user.email);

    // ── Send email in background ──
    if (transporter) {
      console.log('📧 Sending verification email to:', user.email);
      transporter.sendMail({
        to: user.email,
        from: `"Nota" <${process.env.EMAIL_FROM || 'noreply@nota.com'}>`,
        subject: 'Verify Your Email - Nota',
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px; }
              .code { font-size: 32px; letter-spacing: 4px; background: #f0f4ff; padding: 10px 20px; display: inline-block; border-radius: 5px; font-weight: bold; color: #3b82f6; }
              .footer { margin-top: 20px; font-size: 12px; color: #999; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>Welcome to Nota! 🎉</h1>
              <p>Thanks for signing up. Please use the code below to verify your email address:</p>
              <div style="text-align: center; margin: 30px 0;">
                <span class="code">${code}</span>
              </div>
              <p>This code will expire in <strong>15 minutes</strong>.</p>
              <p>If you didn't sign up for Nota, please ignore this email.</p>
              <div class="footer">
                <p>Nota - Your smart note-taking app</p>
              </div>
            </div>
          </body>
          </html>
        `,
      })
      .then(() => console.log('✅ Verification email sent to:', user.email))
      .catch((err) => console.error('❌ Email send error:', err));
    } else {
      console.warn('⚠️ Email not sent: transporter not configured');
    }

    // ── Respond immediately ──
    res.status(201).json({
      message: 'Account created. Please check your email for verification code.',
      email: user.email,
    });

  } catch (err) {
    console.error('❌ Signup error:', err);
    res.status(400).json({ message: err.message });
  }
});

// ─── SEND VERIFICATION (resend) ───
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
      transporter.sendMail({
        to: user.email,
        from: `"Nota" <${process.env.EMAIL_FROM || 'noreply@nota.com'}>`,
        subject: 'Resend Verification Code',
        html: `
          <h1>Resend Verification Code</h1>
          <p>Your new verification code is:</p>
          <h2 style="font-size: 32px; letter-spacing: 4px; background: #f0f4ff; padding: 10px 20px; display: inline-block;">${code}</h2>
          <p>This code expires in 15 minutes.</p>
        `,
      }).catch(err => console.error('❌ Email send error:', err));
    }

    res.json({ message: 'New verification code sent to your email.' });
  } catch (err) {
    console.error('Send verification error:', err);
    res.status(500).json({ message: 'Error sending verification email.' });
  }
});

// ─── VERIFY EMAIL ───
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
    user.lastVerificationRequestAt = undefined;
    await user.save();

    res.json({ message: 'Email verified successfully. You can now login.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ─── FORGOT PASSWORD ───
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
    }

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
        from: `"Nota" <${process.env.EMAIL_FROM || 'noreply@nota.com'}>`,
        subject: 'Password Reset',
        html: `
          <h1>Password Reset</h1>
          <p>You requested a password reset. Click the link below:</p>
          <a href="${resetUrl}" style="display:inline-block; padding:10px 20px; background:#3b82f6; color:white; text-decoration:none; border-radius:5px;">Reset Password</a>
          <p>This link expires in 1 hour.</p>
        `,
      }).catch(err => console.error('❌ Email send error:', err));
    }

    res.json({ message: 'If an account with that email exists, a reset link has been sent.' });
  } catch (err) {
    console.error('Forgot password error:', err);
    res.status(500).json({ message: 'Error sending email.' });
  }
});

// ─── RESET PASSWORD ───
router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    if (!isPasswordStrong(newPassword)) {
      return res.status(400).json({
        message: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.'
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    user.lastVerificationRequestAt = undefined;
    await user.save();

    res.json({ message: 'Password has been reset successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
        message: 'Please verify your email before logging in.',
        needsVerification: true,
        email: user.email,
      });
    }

    if (!user.password) {
      return res.status(401).json({
        message: 'This account uses Google Sign-In.',
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

module.exports = router;