const express = require('express');
const auth = require('../middleware/auth');
const {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicTrip,
  regenerateDay
} = require('../controllers/tripController');

const router = express.Router();

// Public routes (no authentication required)
router.get('/public/:id', getPublicTrip);

// Protected routes (authentication middleware required)
router.use(auth);

router.post('/', generateTrip);
router.get('/', getUserTrips);
router.get('/:id', getTripById);
router.put('/:id', updateTrip);
router.delete('/:id', deleteTrip);
router.post('/:id/regenerate-day', regenerateDay);

module.exports = router;
