import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment, Service } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';
import Razorpay from 'razorpay';
import mongoose from 'mongoose';

const keyId = (process.env.RAZORPAY_KEY_ID || 'rzp_test_TssirY8P33aIzy').replace(/["']/g, '').trim();
const keySecret = (process.env.RAZORPAY_KEY_SECRET || 'ihITDpJI24hbKHgQYAYKtj9D').replace(/["']/g, '').trim();

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

    // Determine amount respecting customAmount (with coupon discount) or appointment totalAmount
    let amount = 650;
    if (customAmount !== undefined && customAmount !== null && Number(customAmount) > 0) {
      amount = Number(customAmount);
    } else if (appointment?.totalAmount && Number(appointment.totalAmount) > 0) {
      amount = Number(appointment.totalAmount);
    } else if (appointment?.serviceId) {
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
      console.error('[RAZORPAY ORDER ERROR]: Order creation failed:', rzpError?.error || rzpError?.message || rzpError);
      return NextResponse.json({
        error: `Razorpay Order Error: ${rzpError?.error?.description || rzpError?.message || 'Failed to initialize payment gateway order'}`,
        details: rzpError?.error || rzpError?.message,
      }, { status: 400 });
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
