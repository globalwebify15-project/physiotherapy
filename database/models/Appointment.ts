import mongoose, { Schema, Document } from 'mongoose';

export interface IStatusTimeline {
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  timestamp: Date;
  note?: string;
}

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  serviceId: mongoose.Types.ObjectId;
  therapistId?: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  timeSlot: string; // e.g. "10:00"
  visitType: 'clinic' | 'home';
  address?: string; // required if home visit
  status: 'pending' | 'confirmed' | 'assigned' | 'in-progress' | 'completed' | 'cancelled';
  statusTimeline: IStatusTimeline[];
  paymentId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema: Schema = new Schema(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'Patient', required: true },
    serviceId: { type: Schema.Types.ObjectId, ref: 'Service', required: true },
    therapistId: { type: Schema.Types.ObjectId, ref: 'Therapist' },
    date: { type: String, required: true, index: true }, // Format: YYYY-MM-DD
    timeSlot: { type: String, required: true }, // Format: HH:MM
    visitType: { type: String, enum: ['clinic', 'home'], required: true },
    address: { type: String }, // optional clinic address, required if home visit
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'assigned', 'in-progress', 'completed', 'cancelled'],
      default: 'pending',
      index: true,
    },
    statusTimeline: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment' },
    notes: { type: String },
  },
  { timestamps: true }
);

// Index to quickly check therapist conflicts
AppointmentSchema.index({ therapistId: 1, date: 1, timeSlot: 1 }, { unique: true, sparse: true });

export const Appointment =
  mongoose.models.Appointment || mongoose.model<IAppointment>('Appointment', AppointmentSchema);
