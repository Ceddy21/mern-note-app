const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const auth = require('../middleware/auth');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { v2: cloudinary } = require('cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: process.env.EMAIL_SECURE === 'true' || false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

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

router.put('/profile', auth, async (req, res) => {
  try {
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const existing = await User.findOne({ username: username.trim(), _id: { $ne: req.userId } });
    if (existing) return res.status(400).json({ message: 'Username already taken' });

    user.username = username.trim();
    await user.save();

    res.json({ message: 'Username updated successfully', user: { id: user._id, username: user.username, email: user.email, avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/password', auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current password and new password are required' });
    }

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. No password to change.' });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(401).json({ message: 'Current password is incorrect' });

    const isStrong = (p) => p.length >= 8 && /[A-Z]/.test(p) && /[a-z]/.test(p) && /[0-9]/.test(p) && /[!@#$%^&*_]/.test(p);
    if (!isStrong(newPassword)) {
      return res.status(400).json({ message: 'New password must be at least 8 characters with uppercase, lowercase, number, and special character.' });
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/avatar', auth, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No image uploaded' });

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'noteapp/avatars', width: 200, height: 200, crop: 'fill', gravity: 'face' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (user.avatar) {
      const publicId = user.avatar.split('/').pop().split('.')[0];
      await cloudinary.uploader.destroy(`noteapp/avatars/${publicId}`);
    }

    user.avatar = result.secure_url;
    await user.save();

    res.json({ avatar: user.avatar, message: 'Avatar updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/delete-request', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const cooldown = checkCooldown(user);
    if (cooldown.blocked) {
      const minutes = Math.ceil(cooldown.remainingSeconds / 60);
      return res.status(429).json({
        message: `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before requesting a new deletion code.`,
        remainingSeconds: cooldown.remainingSeconds
      });
    }

    const code = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationCode = code;
    user.verificationCodeExpires = Date.now() + 15 * 60 * 1000;
    user.lastVerificationRequestAt = new Date();
    await user.save();

    await transporter.sendMail({
      to: user.email,
      from: `"App Name" <${process.env.EMAIL_FROM || 'noreply@yourapp.com'}>`,
      subject: 'Account Deletion Confirmation',
      html: `
        <h1>Delete Your Account</h1>
        <p>You requested to delete your account. Your deletion code is:</p>
        <h2 style="font-size: 32px; letter-spacing: 4px; background: #f0f0f0; padding: 10px 20px; display: inline-block;">${code}</h2>
        <p>This code expires in 15 minutes.</p>
        <p>If you did not request this, please ignore this email.</p>
      `,
    });

    res.json({ message: 'Deletion code sent to your email.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/delete-account', auth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) return res.status(400).json({ message: 'Verification code required' });

    const user = await User.findOne({
      _id: req.userId,
      verificationCode: code,
      verificationCodeExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired code' });
    }

    await User.findByIdAndDelete(req.userId);
    res.json({ message: 'Account deleted permanently.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;