import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  patientId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  serviceId?: mongoose.Types.ObjectId;
  appointmentId?: mongoose.Types.ObjectId;
  rating: number; // 1 to 5
  comment?: string;
  isModerated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist' },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service' },
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', sparse: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String },
    isModerated: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Review = mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);
