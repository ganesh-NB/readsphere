const express = require('express');
const User = require('../models/User');
const router = express.Router();

// @route   POST /api/admin/setup
// @desc    Setup initial admin user (only works if no admin exists)
// @access  Public (should be disabled in production after first use)
router.post('/setup', async (req, res) => {
  try {
    // Check if any admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    
    if (existingAdmin) {
      return res.status(403).json({ 
        message: 'Admin already exists. This endpoint is disabled.' 
      });
    }

    // Create admin user
    const adminUser = new User({
      username: 'ganesh',
      email: 'ganesh@readsphere.com',
      password: 'Ganesh@123',
      displayName: 'Ganesh',
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: {
        username: adminUser.username,
        email: adminUser.email,
        role: adminUser.role
      }
    });
  } catch (error) {
    console.error('Admin setup error:', error);
    res.status(500).json({ message: 'Server error during admin setup' });
  }
});

// @route   POST /api/admin/create
// @desc    Create admin user (for development only)
// @access  Public (remove in production)
router.post('/create', async (req, res) => {
  try {
    const { username, email, password, secretKey } = req.body;

    // Simple secret key check (change this in production)
    if (secretKey !== 'setup-admin-2024') {
      return res.status(401).json({ message: 'Invalid secret key' });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      // Update to admin
      existingUser.role = 'admin';
      existingUser.username = username;
      await existingUser.save();
      return res.json({
        success: true,
        message: 'User updated to admin',
        user: existingUser.getPublicProfile()
      });
    }

    // Create new admin
    const adminUser = new User({
      username,
      email,
      password,
      displayName: username,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();

    res.status(201).json({
      success: true,
      message: 'Admin user created successfully',
      user: adminUser.getPublicProfile()
    });
  } catch (error) {
    console.error('Admin creation error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
