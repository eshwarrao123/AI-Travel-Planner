const Trip = require('../models/Trip');

// Exponential backoff executor for external API resilience
async function fetchWithRetry(url, options, retries = 5, delay = 1000) {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Wait and retry on rate limits
        await new Promise(resolve => setTimeout(resolve, delay));
        return fetchWithRetry(url, options, retries - 1, delay * 2);
      }
      throw new Error(`External API Error: Status Code ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw error;
  }
}

const generateTrip = async (req, res) => {
  try {
    const { destination, durationDays, budgetTier, interests } = req.body;

    if (!destination || !durationDays || !budgetTier || !interests) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const userId = req.user.id;

    const prompt = `
      Create a detailed travel plan for a ${durationDays}-day trip to ${destination}.
      Budget preference is ${budgetTier}. Interests are: ${Array.isArray(interests) ? interests.join(', ') : interests}.

      You must output ONLY a valid JSON object matching this structure:
      {
        "itinerary": [
          {
            "dayNumber": 1,
            "activities": [
              { "title": "Activity name", "description": "Brief text details", "estimatedCostUSD": 20, "timeOfDay": "Morning" }
            ]
          }
        ],
        "hotels": [
          { "name": "Recommended Hotel", "tier": "Budget", "estimatedCostNightUSD": 85, "rating": "4.5/5" }
        ],
        "estimatedBudget": {
          "transport": 120,
          "accommodation": 300,
          "food": 150,
          "activities": 100,
          "total": 670
        },
        "packingList": [
          { "item": "Passport", "category": "Documents", "isPacked": false }
        ]
      }
      Make sure estimates match typical realistic local rates for the specified budgetTier.
    `;

    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const requestPayload = {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json"
      }
    };

    const data = await fetchWithRetry(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestPayload)
    });

    const parsedResponseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!parsedResponseText) {
      throw new Error("Could not extract generation data from response.");
    }

    const cleanResult = JSON.parse(parsedResponseText);

    const newTrip = new Trip({
      userId,
      destination,
      durationDays,
      budgetTier,
      interests: Array.isArray(interests) ? interests : [interests],
      itinerary: cleanResult.itinerary,
      hotels: cleanResult.hotels,
      estimatedBudget: cleanResult.estimatedBudget,
      packingList: cleanResult.packingList
    });

    const savedTrip = await newTrip.save();
    return res.status(201).json(savedTrip);
  } catch (error) {
    console.error("Trip Generation Error:", error);
    return res.status(500).json({ message: "Server error generating trip itinerary", error: error.message });
  }
};

const getUserTrips = async (req, res) => {
  try {
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json(trips);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching user trips", error: error.message });
  }
};

const getTripById = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    return res.status(200).json(trip);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching trip", error: error.message });
  }
};

const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    Object.assign(trip, req.body);
    const updatedTrip = await trip.save();
    return res.status(200).json(updatedTrip);
  } catch (error) {
    return res.status(500).json({ message: "Server error updating trip", error: error.message });
  }
};

const deleteTrip = async (req, res) => {
  try {
    const deletedTrip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!deletedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ message: "Server error deleting trip", error: error.message });
  }
};

const getPublicTrip = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).select('-userId');
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }
    return res.status(200).json(trip);
  } catch (error) {
    return res.status(500).json({ message: "Server error fetching public trip", error: error.message });
  }
};

module.exports = {
  generateTrip,
  getUserTrips,
  getTripById,
  updateTrip,
  deleteTrip,
  getPublicTrip
};
