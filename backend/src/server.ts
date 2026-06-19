import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middlewares
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Placeholder routes
app.get('/api/auth', (req: Request, res: Response) => {
  res.json({ message: 'Auth endpoint placeholder' });
});

app.get('/api/trips', (req: Request, res: Response) => {
  res.json({ message: 'Trips endpoint placeholder' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
