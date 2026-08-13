import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment, Patient, User } from 'database';
import crypto from 'crypto';
import { createNotification } from '@/utils/notifications';

const RAZORPAY_KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || 'rzp_test_secret_placeholder';

// POST /api/payments/verify - Verify Razorpay payment signature
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing required validation fields' }, { status: 400 });
    }

    let isValid = false;

    // Sandbox check bypass
    if (razorpayOrderId.startsWith('order_sandbox_') || RAZORPAY_KEY_SECRET === 'rzp_test_secret_placeholder') {
      console.log('[PAYMENT VERIFY] Sandbox mode bypass for order:', razorpayOrderId);
      isValid = true;
    } else {
      if (!razorpaySignature) {
        return NextResponse.json({ error: 'Signature is required for production verify' }, { status: 400 });
      }

      // Generate expected signature
      const bodyStr = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(bodyStr)
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    }

    if (!isValid) {
      // Find payment record to update status to failed
      const payment = await Payment.findOne({ razorpayOrderId });
      if (payment) {
        payment.status = 'failed';
        payment.history.push({ status: 'failed', note: 'Signature verification failed.' });
        await payment.save();
      }
      return NextResponse.json({ error: 'Invalid signature. Payment verification failed.' }, { status: 400 });
    }

    // Update payment record
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) {
      return NextResponse.json({ error: 'Payment transaction record not found' }, { status: 404 });
    }

    payment.status = 'paid';
    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.history.push({ status: 'paid', note: 'Payment verified and success.' });
    await payment.save();

    // Update appointment status to confirmed
    const appointment = await Appointment.findById(payment.appointmentId);
    if (appointment) {
      appointment.status = 'confirmed';
      appointment.statusTimeline.push({
        status: 'confirmed',
        note: 'Appointment confirmed following payment success.',
      });
      await appointment.save();

      // Dispatch Notifications
      try {
        const patient = await Patient.findById(appointment.patientId);
        if (patient) {
          await createNotification(
            patient.userId,
            'Payment Confirmed',
            `Your payment of ₹${payment.amount} has been verified successfully. Your booking is confirmed!`,
            'payment_alert',
            { appointmentId: appointment._id, paymentId: payment._id }
          );
        }

        const adminUser = await User.findOne({ role: 'superadmin' });
        if (adminUser) {
          await createNotification(
            adminUser._id,
            'Payment Captured',
            `A payment of ₹${payment.amount} has been successfully verified for Appointment ID: ${appointment._id}.`,
            'payment_alert',
            { appointmentId: appointment._id, paymentId: payment._id }
          );
        }
      } catch (notifErr) {
        console.error('Failed to dispatch payment notifications:', notifErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment successfully verified and appointment confirmed.',
      payment,
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
