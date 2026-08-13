import mongoose, { Schema, Document } from 'mongoose';

export interface IPaymentHistory {
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  timestamp: Date;
  note?: string;
}

export interface IPayment extends Document {
  appointmentId: mongoose.Types.ObjectId;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  amount: number; // in paise or rupees. Let's store in rupees (e.g. 500)
  currency: string; // e.g. "INR"
  status: 'pending' | 'paid' | 'failed' | 'refunded';
  history: IPaymentHistory[];
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema: Schema = new Schema(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: 'Appointment', required: true },
    razorpayOrderId: { type: String, required: true, unique: true, index: true },
    razorpayPaymentId: { type: String, sparse: true },
    razorpaySignature: { type: String, sparse: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    status: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    history: [
      {
        status: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        note: { type: String },
      },
    ],
  },
  { timestamps: true }
);

export const Payment = mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);
