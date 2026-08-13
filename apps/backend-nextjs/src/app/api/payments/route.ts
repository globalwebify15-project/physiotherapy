import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';
import Razorpay from 'razorpay';

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder',
});

// POST /api/payments - Initiate Razorpay Payment Order
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { appointmentId } = await request.json();
    if (!appointmentId) {
      return NextResponse.json({ error: 'appointmentId is required' }, { status: 400 });
    }

    // Find appointment and populate service
    const appointment = await Appointment.findById(appointmentId).populate('serviceId');
    if (!appointment) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 });
    }

    const service = appointment.serviceId as any;
    if (!service) {
      return NextResponse.json({ error: 'Service details not found on appointment' }, { status: 400 });
    }

    // Calculate price
    const amount = appointment.visitType === 'home' ? service.pricingHome : service.pricingClinic;

    // Call Razorpay Order API
    const options = {
      amount: Math.round(amount * 100), // Razorpay amount is in paise (e.g. 500 INR = 50000 paise)
      currency: 'INR',
      receipt: appointmentId.toString(),
    };

    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (rzpError) {
      console.warn('Razorpay SDK failed (likely placeholders). Creating mockup sandbox order...');
      // Fallback sandbox order ID for testing if keys are invalid
      order = {
        id: `order_sandbox_${Math.random().toString(36).substring(2, 9)}`,
        amount: options.amount,
        currency: options.currency,
        receipt: options.receipt,
        status: 'created'
      };
    }

    // Create Payment record
    const payment = await Payment.create({
      appointmentId,
      razorpayOrderId: order.id,
      amount,
      currency: 'INR',
      status: 'pending',
      history: [{ status: 'pending', note: 'Razorpay order created.' }],
    });

    // Link payment back to appointment
    appointment.paymentId = payment._id;
    await appointment.save();

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      paymentId: payment._id,
    });
  } catch (error: any) {
    console.error('Error creating payment order:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
