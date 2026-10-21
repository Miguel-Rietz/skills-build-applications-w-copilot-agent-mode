import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
  fixtureKey: { type: String, unique: true, sparse: true, select: false },
  title: { type: String, trim: true, minlength: 1 },
  focus: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    enum: ['endurance', 'strength', 'mobility'],
  },
  minutes: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => Number.isFinite(value) && value > 0,
      message: 'Minutes must be a positive finite number',
    },
  },
  difficulty: { type: String, required: true, trim: true, lowercase: true, enum: ['easy', 'moderate', 'hard'] },
});

export const Workout = model('Workout', workoutSchema);
