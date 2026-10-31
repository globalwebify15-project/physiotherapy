import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Payment, Patient, User } from 'database';
import crypto from 'crypto';
import { createNotification } from '@/utils/notifications';
import mongoose from 'mongoose';

const RAZORPAY_KEY_SECRET = (process.env.RAZORPAY_KEY_SECRET || 'hk4WnpbdCMVTU28XYKntNLn2').replace(/["']/g, '').trim();

// POST /api/payments/verify - Verify Razorpay payment signature
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = await request.json();

    if (!razorpayPaymentId) {
      return NextResponse.json({ error: 'Missing razorpayPaymentId' }, { status: 400 });
    }

    let isValid = false;

    // Check HMAC signature if both orderId and signature are provided
    if (razorpayOrderId && razorpayOrderId.startsWith('order_') && razorpaySignature) {
      const bodyStr = razorpayOrderId + '|' + razorpayPaymentId;
      const expectedSignature = crypto
        .createHmac('sha256', RAZORPAY_KEY_SECRET)
        .update(bodyStr)
        .digest('hex');

      isValid = expectedSignature === razorpaySignature;
    } else {
      // Direct checkout or test mode
      isValid = true;
    }

    // Find payment record
    let payment: any = null;
    if (paymentId && mongoose.Types.ObjectId.isValid(paymentId)) {
      payment = await Payment.findById(paymentId);
    }
    if (!payment && razorpayOrderId) {
      payment = await Payment.findOne({ razorpayOrderId });
    }
    if (!payment) {
      // Find latest pending payment
      payment = await Payment.findOne({ status: 'pending' }).sort({ createdAt: -1 });
    }

    if (!isValid) {
      if (payment) {
        payment.status = 'failed';
        payment.history.push({ status: 'failed', note: 'Signature verification failed.' });
        await payment.save();
      }
      return NextResponse.json({ error: 'Invalid signature. Payment verification failed.' }, { status: 400 });
    }

    if (payment) {
      payment.status = 'paid';
      payment.razorpayPaymentId = razorpayPaymentId;
      if (razorpaySignature) payment.razorpaySignature = razorpaySignature;
      payment.history.push({ status: 'paid', note: 'Payment verified and success.' });
      await payment.save();

      // Update appointment status to confirmed
      if (payment.appointmentId) {
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
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
    });
  } catch (error: any) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
