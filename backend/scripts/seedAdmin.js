const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
require('dotenv').config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/readsphere');

    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'ganesh@readsphere.com' });
    
    if (existingAdmin) {
      // Update existing user to admin and re-hash password
      existingAdmin.role = 'admin';
      existingAdmin.username = 'ganesh';
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('Ganesh@123', salt);
      await existingAdmin.save();
      console.log('Existing user updated to admin:', existingAdmin.getPublicProfile());
    } else {
      // Create new admin user with hashed password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash('Ganesh@123', salt);
      
      const adminUser = new User({
        username: 'ganesh',
        email: 'ganesh@readsphere.com',
        password: hashedPassword,
        displayName: 'Ganesh',
        role: 'admin',
        isActive: true
      });

      await adminUser.save();
      console.log('Admin user created successfully!');
      console.log('Email: ganesh@readsphere.com');
      console.log('Username: ganesh');
      console.log('Role: admin');
    }

    console.log('\nYou can now login with:');
    console.log('Email: ganesh@readsphere.com');
    console.log('Password: Ganesh@123');

  } catch (error) {
    console.error('Error seeding admin:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
};

seedAdmin();
