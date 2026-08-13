import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact {
  name: string;
  phone: string;
  relation: string;
}

export interface IPatient extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  gender: 'male' | 'female' | 'other';
  dob: Date;
  profilePhoto?: string;
  medicalHistory: string[];
  emergencyContact: IEmergencyContact;
  savedAddresses: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PatientSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female', 'other'], required: true },
    dob: { type: Date, required: true },
    profilePhoto: { type: String },
    medicalHistory: [{ type: String }],
    emergencyContact: {
      name: { type: String, required: true },
      phone: { type: String, required: true },
      relation: { type: String, required: true },
    },
    savedAddresses: [{ type: String }],
  },
  { timestamps: true }
);

export const Patient = mongoose.models.Patient || mongoose.model<IPatient>('Patient', PatientSchema);
