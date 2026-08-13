import mongoose, { Schema, Document } from 'mongoose';

export interface IWorkingHours {
  start: string; // e.g., "09:00"
  end: string;   // e.g., "18:00"
}

export interface ITherapist extends Document {
  name: string;
  email: string;
  mobile: string;
  profilePhoto?: string;
  qualification: string;
  experience: number; // in years
  specialization: string[];
  workingHours: IWorkingHours;
  workingDays: number[]; // e.g., [1, 2, 3, 4, 5] (Monday-Friday)
  isActive: boolean;
  ratingAverage: number;
  ratingCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const TherapistSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    profilePhoto: { type: String },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true, default: 0 },
    specialization: [{ type: String }],
    workingHours: {
      start: { type: String, required: true, default: '09:00' },
      end: { type: String, required: true, default: '18:00' },
    },
    workingDays: [{ type: Number, default: [1, 2, 3, 4, 5] }], // default Mon-Fri
    isActive: { type: Boolean, default: true },
    ratingAverage: { type: Number, default: 5.0 },
    ratingCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Therapist = mongoose.models.Therapist || mongoose.model<ITherapist>('Therapist', TherapistSchema);
