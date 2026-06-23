require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const tripRoutes = require('./routes/tripRoutes');

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const allowedOrigins = ['http://localhost:3000'];
    
    if (process.env.FRONTEND_URL) {
      // Clean up the URL if it was provided without https:// or with a trailing slash
      let frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, '');
      if (!frontendUrl.startsWith('http')) {
        frontendUrl = `https://${frontendUrl}`;
      }
      allowedOrigins.push(frontendUrl);
    }

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
