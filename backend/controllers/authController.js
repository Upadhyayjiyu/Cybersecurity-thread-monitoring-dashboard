const User = require('../models/User');
const LoginLog = require('../models/LoginLog');
const Alert = require('../models/Alert');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const geoip = require('geoip-lite');

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const register = async (req, res) => {
  try {
    const { username, password, role } = req.body;
    
    const userExists = await User.findOne({ username });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      username,
      password: hashedPassword,
      role: role || 'User', // Allow setting Admin for testing purposes
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const geo = geoip.lookup(ipAddress) || { country: 'Unknown', city: 'Unknown' };
    const device = req.headers['user-agent'];

    const user = await User.findOne({ username });

    let isMatch = false;
    if (user) {
      isMatch = await bcrypt.compare(password, user.password);
    }

    // Log the attempt
    await LoginLog.create({
      userId: user ? user._id : null,
      username,
      ipAddress,
      country: geo.country,
      city: geo.city,
      device,
      success: isMatch,
    });

    // --- Anomaly Detection Logic ---
    const io = req.app.get('io');
    
    if (!isMatch) {
      // Check for brute force (e.g., > 5 failed attempts in last 5 mins for this username)
      const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
      const recentFailures = await LoginLog.countDocuments({
        username,
        success: false,
        createdAt: { $gte: fiveMinsAgo }
      });

      if (recentFailures >= 5) {
        const alert = await Alert.create({
          type: 'Brute Force Attempt',
          message: `Multiple failed logins detected for username: ${username}`,
          severity: 'Critical',
          userId: user ? user._id : null,
          ipAddress
        });
        io.emit('new_alert', alert); // Notify frontend
      }

      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Check for unusual location
    const previousSuccessfulLogins = await LoginLog.find({ userId: user._id, success: true }).sort({ createdAt: -1 }).limit(2);
    if (previousSuccessfulLogins.length > 1) {
      const lastLogin = previousSuccessfulLogins[1]; // Index 1 is the previous one (index 0 is current)
      if (lastLogin.country !== geo.country && lastLogin.country !== 'Unknown') {
        const alert = await Alert.create({
          type: 'Anomalous Location',
          message: `Login from new country (${geo.country}) for user: ${username}`,
          severity: 'High',
          userId: user._id,
          ipAddress
        });
        io.emit('new_alert', alert);
      }
    }

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { register, login, getMe };
