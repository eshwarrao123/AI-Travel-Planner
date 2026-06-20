import { Request, Response } from 'express';
import Trip from '../models/Trip.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 5,
  delay = 1000
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
  try {
    const res = await fetch(url, options);

    if (res.status === 429) {
      if (retries === 0) throw new Error('Rate limited: max retries exceeded (429)');
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }

    if (!res.ok) {
      throw new Error(`Gemini API error: ${res.status} ${res.statusText}`);
    }

    return res.json();
  } catch (err) {
    // Network-level error (not an HTTP error response)
    if (err instanceof TypeError && retries > 0) {
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, delay * 2);
    }
    throw err;
  }
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

interface PromptParams {
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
}

const COST_RANGES: Record<string, string> = {
  Low: '$0–$50/day for activities, budget hostels/guesthouses (~$20–$50/night)',
  Medium: '$50–$150/day for activities, mid-range hotels (~$80–$180/night)',
  High: '$150+/day for activities, luxury hotels (~$200+/night)',
};

function buildPrompt({ destination, durationDays, budgetTier, interests }: PromptParams): string {
  const interestStr = interests.length > 0 ? interests.join(', ') : 'general sightseeing';
  const costRange = COST_RANGES[budgetTier];

  return `You are an expert travel planner with deep knowledge of destinations worldwide.

Plan a ${durationDays}-day trip to ${destination} for a traveller with a ${budgetTier} budget.
Interests: ${interestStr}.
Budget tier guidance — ${budgetTier}: ${costRange}.

Your response MUST be ONLY valid JSON — no markdown, no code fences, no explanation before or after.
The JSON must conform exactly to this structure (do not add extra keys):

{
  "itinerary": [
    {
      "dayNumber": 1,
      "activities": [
        {
          "title": "string",
          "description": "string",
          "estimatedCostUSD": 0,
          "timeOfDay": "Morning" | "Afternoon" | "Evening"
        }
      ]
    }
  ],
  "hotels": [
    {
      "name": "string",
      "tier": "string",
      "estimatedCostNightUSD": 0,
      "rating": "string"
    }
  ],
  "estimatedBudget": {
    "transport": 0,
    "accommodation": 0,
    "food": 0,
    "activities": 0,
    "total": 0
  },
  "packingList": [
    {
      "item": "string",
      "category": "Documents" | "Clothing" | "Gear" | "Other",
      "isPacked": false
    }
  ]
}

Rules:
- Produce exactly ${durationDays} day entries in itinerary, each with 3 activities spread across Morning, Afternoon, and Evening.
- estimatedCostUSD values must be realistic for the ${budgetTier} budget tier.
- estimatedBudget.total must equal the sum of transport + accommodation + food + activities.
- packingList must include items appropriate for ${destination}'s climate and the planned activities.
- packingList category must be one of: "Documents", "Clothing", "Gear", "Other".
- All number fields must be numbers (not strings).
- isPacked must always be false.
- Output raw JSON only. Any non-JSON output will cause a critical failure.`;
}

// ---------------------------------------------------------------------------
// Controllers
// ---------------------------------------------------------------------------

export const getUserTrips = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const trips = await Trip.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, trips });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const getTripById = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const trip = await Trip.findOne({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found' });
      return;
    }
    res.status(200).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const updateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const trip = await Trip.findOne({ _id: req.params.id });
    if (!trip || trip.userId.toString() !== req.user.id) {
      res.status(403).json({ success: false, message: 'Forbidden: Trip not found or user mismatch' });
      return;
    }

    Object.assign(trip, req.body);
    await trip.save();

    res.status(200).json({ success: true, trip });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const deleteTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }
    const trip = await Trip.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!trip) {
      res.status(404).json({ success: false, message: 'Trip not found or unauthorized' });
      return;
    }
    res.status(200).json({ success: true, message: 'Trip deleted successfully' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err });
  }
};

export const generateTrip = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { destination, durationDays, budgetTier, interests } = req.body;

    // Validate required fields
    if (!destination || !durationDays || !budgetTier) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields: destination, durationDays, and budgetTier are required.',
      });
      return;
    }

    const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
    if (!GEMINI_API_KEY) {
      res.status(500).json({ success: false, message: 'Gemini API key is not configured.' });
      return;
    }

    const prompt = buildPrompt({
      destination,
      durationDays: Number(durationDays),
      budgetTier,
      interests: Array.isArray(interests) ? interests : [],
    });

    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

    const data = await fetchWithRetry(geminiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: 'application/json' },
      }),
    });

    const rawText: string = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(rawText);

    const trip = new Trip({
      userId: req.user.id,
      destination,
      durationDays: Number(durationDays),
      budgetTier,
      interests: Array.isArray(interests) ? interests : [],
      itinerary: parsed.itinerary ?? [],
      hotels: parsed.hotels ?? [],
      estimatedBudget: parsed.estimatedBudget ?? {},
      packingList: parsed.packingList ?? [],
    });

    await trip.save();

    res.status(201).json({ success: true, trip });
  } catch {
    res.status(500).json({
      success: false,
      message: 'Trip generation failed. Please try again.',
    });
  }
};
