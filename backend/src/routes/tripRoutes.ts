import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip
} from '../controllers/tripController.js';

const router = Router();

// Apply auth middleware to all routes
router.use(protect);

router.post('/', generateTrip);
router.get('/', getUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);

export default router;
