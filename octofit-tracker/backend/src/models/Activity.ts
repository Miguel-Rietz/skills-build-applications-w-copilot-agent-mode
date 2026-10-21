import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
  fixtureKey: { type: String, unique: true, sparse: true, select: false },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, required: true, trim: true, minlength: 1 },
  minutes: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => Number.isFinite(value) && value > 0,
      message: 'Minutes must be a positive finite number',
    },
  },
  points: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => Number.isFinite(value) && value > 0,
      message: 'Points must be a positive finite number',
    },
  },
  occurredAt: { type: Date, required: true },
});

export const Activity = model('Activity', activitySchema);
