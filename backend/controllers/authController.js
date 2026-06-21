const jwt = require('jsonwebtoken');
const User = require('../models/User');

const signToken = (id, email) =>
  jwt.sign({ id, email }, process.env.JWT_SECRET, { expiresIn: '7d' });

const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = new User({ email, password });
    await user.save();

    const token = signToken(user._id, user.email);

    return res.status(201).json({
      success: true,
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id, user.email);

    return res.status(200).json({
      success: true,
      token,
      user: { id: user._id, email: user.email },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { register, login };
