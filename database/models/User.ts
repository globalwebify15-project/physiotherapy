import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  mobile: string;
  email?: string;
  role: 'patient' | 'admin' | 'superadmin' | 'receptionist' | 'therapist';
  passwordHash?: string; // only for admin/staff/therapists who login with passwords
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    mobile: { type: String, required: true, unique: true, index: true },
    email: { type: String, sparse: true },
    role: {
      type: String,
      enum: ['patient', 'admin', 'superadmin', 'receptionist', 'therapist'],
      default: 'patient',
    },
    passwordHash: { type: String },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
