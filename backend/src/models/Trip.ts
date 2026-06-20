import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IActivity {
  title: string;
  description?: string;
  estimatedCostUSD: number;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening';
}

export interface IDay {
  dayNumber: number;
  activities: IActivity[];
}

export interface IHotel {
  name: string;
  tier?: string;
  estimatedCostNightUSD?: number;
  rating?: string;
}

export interface IEstimatedBudget {
  transport: number;
  accommodation: number;
  food: number;
  activities: number;
  total: number;
}

export interface IPackingItem {
  item: string;
  category: 'Documents' | 'Clothing' | 'Gear' | 'Other';
  isPacked: boolean;
}

export interface ITrip extends Document {
  userId: Types.ObjectId;
  destination: string;
  durationDays: number;
  budgetTier: 'Low' | 'Medium' | 'High';
  interests: string[];
  itinerary: IDay[];
  hotels: IHotel[];
  estimatedBudget: IEstimatedBudget;
  packingList: IPackingItem[];
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  estimatedCostUSD: { type: Number, default: 0 },
  timeOfDay: { type: String, enum: ['Morning', 'Afternoon', 'Evening'], required: true }
}, { _id: false });

const DaySchema = new Schema({
  dayNumber: { type: Number, required: true },
  activities: [ActivitySchema]
}, { _id: false });

const HotelSchema = new Schema({
  name: { type: String, required: true },
  tier: { type: String },
  estimatedCostNightUSD: { type: Number },
  rating: { type: String }
}, { _id: false });

const PackingItemSchema = new Schema({
  item: { type: String, required: true },
  category: { type: String, enum: ['Documents', 'Clothing', 'Gear', 'Other'], required: true },
  isPacked: { type: Boolean, default: false }
}, { _id: false });

const TripSchema = new Schema<ITrip>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  destination: { type: String, required: true, trim: true },
  durationDays: { type: Number, required: true, min: 1, max: 30 },
  budgetTier: { type: String, enum: ['Low', 'Medium', 'High'], required: true },
  interests: [String],
  itinerary: [DaySchema],
  hotels: [HotelSchema],
  estimatedBudget: {
    transport: { type: Number, default: 0 },
    accommodation: { type: Number, default: 0 },
    food: { type: Number, default: 0 },
    activities: { type: Number, default: 0 },
    total: { type: Number, default: 0 }
  },
  packingList: [PackingItemSchema]
}, {
  timestamps: true
});

export default mongoose.model<ITrip>('Trip', TripSchema);
