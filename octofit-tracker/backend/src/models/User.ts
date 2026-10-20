import { Schema, model } from 'mongoose';

const userSchema = new Schema({
  fixtureKey: { type: String, unique: true, sparse: true, select: false },
  name: { type: String, required: true, trim: true, minlength: 1 },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Email must be valid'],
  },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['endurance', 'strength', 'mobility'],
  },
});

export const User = model('User', userSchema);
