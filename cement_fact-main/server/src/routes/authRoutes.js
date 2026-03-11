const express = require('express');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

function buildToken(user) {
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: '7d'
  });
}

router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contactNo, place, address, state } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, contactNo, place, address, state, role: 'customer' });

    const token = buildToken(user);
    return res.status(201).json({
      token,
      user: { id: user._id, name: user.name, email: user.email, contactNo: user.contactNo, place: user.place, address: user.address, state: user.state, role: user.role }
    });
  }
);

router.post(
  '/login',
  [body('email').isEmail(), body('password').notEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = buildToken(user);
    return res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email, contactNo: user.contactNo, place: user.place, address: user.address, state: user.state, role: user.role }
    });
  }
);

router.put(
  '/profile',
  authenticate,
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Valid email is required'),
    body('password').optional().isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, contactNo, place, address, state } = req.body;
    const userId = req.user._id;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (password !== undefined) updateData.password = await bcrypt.hash(password, 10);
    if (contactNo !== undefined) updateData.contactNo = contactNo;
    if (place !== undefined) updateData.place = place;
    if (address !== undefined) updateData.address = address;
    if (state !== undefined) updateData.state = state;

    try {
      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-password');
      return res.json({
        user: { id: user._id, name: user.name, email: user.email, contactNo: user.contactNo, place: user.place, address: user.address, state: user.state, role: user.role }
      });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ message: 'Email already in use' });
      }
      return res.status(500).json({ message: 'Server error' });
    }
  }
);

// Add route to fetch all users
router.get('/users', authenticate, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Google OAuth start
router.get('/google', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  if (!clientId) {
    return res.status(500).json({ message: 'Google OAuth not configured. Set GOOGLE_CLIENT_ID in server .env' });
  }
  const redirectUri = `${req.protocol}://${req.get('host')}/api/auth/google/callback`;
  const scope = encodeURIComponent('openid email profile');
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${scope}&access_type=offline&prompt=consent`;
  return res.redirect(authUrl);
});

// Google OAuth callback
router.get('/google/callback', async (req, res) => {
  const code = req.query.code;
  if (!code) return res.status(400).send('No code provided');

  try {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const params = new URLSearchParams();
    params.append('code', code);
    const clientId = process.env.GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
    if (!clientId || !clientSecret) {
      return res.status(500).send('Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in server .env');
    }
    params.append('client_id', clientId);
    params.append('client_secret', clientSecret);
    params.append('redirect_uri', `${req.protocol}://${req.get('host')}/api/auth/google/callback`);
    params.append('grant_type', 'authorization_code');

    const tokenResp = await axios.post(tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    const accessToken = tokenResp.data.access_token;

    // fetch user info
    const infoResp = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`);
    const profile = infoResp.data; // contains email, name, picture

    // find or create user
    let user = await User.findOne({ email: profile.email });
    if (!user) {
      // create with random password
      const randomPass = Math.random().toString(36).slice(-12);
      const hashed = await bcrypt.hash(randomPass, 10);
      user = await User.create({ name: profile.name || profile.email.split('@')[0], email: profile.email, password: hashed, contactNo: '', place: '', address: '', state: '', role: 'customer' });
    }

    const token = buildToken(user);

    // redirect back to client with token and user info
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    const userSafe = {
      id: user._id,
      name: user.name,
      email: user.email,
      contactNo: user.contactNo,
      place: user.place,
      address: user.address,
      state: user.state,
      role: user.role
    };

    const redirect = `${clientUrl.replace(/\/$/, '')}/login?token=${encodeURIComponent(token)}&user=${encodeURIComponent(JSON.stringify(userSafe))}`;
    return res.redirect(redirect);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Google OAuth error', err?.response?.data || err.message);
    return res.status(500).send('Google OAuth failed');
  }
});

// Add route to delete a user
router.delete('/users/:id', authenticate, async (req, res) => {
  try {
    const userId = req.params.id;
    await User.findByIdAndDelete(userId);
    res.json({ message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
