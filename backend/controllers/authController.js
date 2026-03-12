const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { MOCK_USERS } = require('../data/mockDb');

const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const userExists = MOCK_USERS.find(user => user.email === email);
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = {
      _id: `u${MOCK_USERS.length + 1}`,
      username,
      email,
      password: hashedPassword,
      role: 'user',
      favorites: [],
      bookmarks: []
    };
    
    // In-memory Save
    MOCK_USERS.push(newUser);

    res.status(201).json({
      _id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      role: newUser.role,
      token: generateToken(newUser._id, newUser.role),
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error during registration' });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = MOCK_USERS.find(u => u.email === email);

    // Bypassing bcrypt for hardcoded simulated generic logins for demo purposes, 
    // real app utilizes bcrypt.compare
    const mockPasswordMatch = true; 

    if (user && mockPasswordMatch) {
      res.json({
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        token: generateToken(user._id, user.role),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

const getUserProfile = async (req, res) => {
  try {
    const user = MOCK_USERS.find(u => u._id === req.user.id);
    if (user) {
      // Omit password
      const { password, ...userProfile } = user;
      res.json(userProfile);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving profile' });
  }
};

module.exports = { registerUser, loginUser, getUserProfile };
