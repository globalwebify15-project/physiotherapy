import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment, Service } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';

const keyId = (process.env.RAZORPAY_KEY_ID || 'rzp_test_TtdXW7UMYbdFAC').replace(/["']/g, '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'hk4WnpbdCMVTU28XYKntNLn2').replace(/["']/g, '').trim();

// POST /api/payments - Initiate Razorpay Payment Order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);

    const body = await request.json();
    const { appointmentId, mobile, amount: customAmount } = body;
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }

    let appointment: any = null;
    if (mongoose.Types.ObjectId.isValid(appointmentId)) {
      appointment = await Appointment.findById(appointmentId).populate('serviceId');
    }

    // Determine amount
    let amount = customAmount || 650;
    if (appointment?.serviceId) {
      const service = appointment.serviceId as any;
      amount = appointment.visitType === 'home' ? (service.pricingHome || 950) : (service.pricingClinic || 650);
    }

    const amountInPaise = Math.round(amount * 100);

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    const receiptStr = `rcpt_${Date.now().toString().slice(-8)}_${appointmentId.toString().slice(-8)}`;

    let realOrderId: string | null = null;
    try {
      const order = await razorpay.orders.create({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receiptStr,
      });
      if (order && order.id) {
        realOrderId = order.id;
      }
    } catch (rzpError: any) {
      console.warn('[RAZORPAY ORDER WARNING]: Direct order create failed, falling back to direct checkout:', rzpError?.message || rzpError);
      // realOrderId remains null so Razorpay Flutter SDK will open in direct checkout mode rather than erroring out
    }

    // Create Payment record
    const payment = await Payment.create({
      appointmentId: appointment?._id || new mongoose.Types.ObjectId(),
      razorpayOrderId: realOrderId || `direct_${Date.now()}`,
      amount,
      currency: 'INR',
      status: 'pending',
      history: [{ status: 'pending', note: realOrderId ? 'Razorpay order created.' : 'Direct payment initiated.' }],
    });

    // Link payment back to appointment if appointment exists
    if (appointment) {
      appointment.paymentId = payment._id;
      await appointment.save();
    }

    return NextResponse.json({
      success: true,
      orderId: realOrderId, // null if order creation wasn't required or failed, allowing direct standard checkout
      amount: amountInPaise,
      currency: 'INR',
      paymentId: payment._id,
      keyId,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
