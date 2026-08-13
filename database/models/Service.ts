import mongoose, { Schema, Document } from 'mongoose';

export interface IService extends Document {
  title: string;
  description: string;
  category: string;
  duration: number; // in minutes
  pricingClinic: number;
  pricingHome: number;
  homeVisitAvailable: boolean;
  clinicVisitAvailable: boolean;
  images: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema: Schema = new Schema(
  {
    title: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    duration: { type: Number, required: true, default: 45 }, // default 45 mins
    pricingClinic: { type: Number, required: true },
    pricingHome: { type: Number, required: true },
    homeVisitAvailable: { type: Boolean, default: true },
    clinicVisitAvailable: { type: Boolean, default: true },
    images: [{ type: String }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Service = mongoose.models.Service || mongoose.model<IService>('Service', ServiceSchema);
