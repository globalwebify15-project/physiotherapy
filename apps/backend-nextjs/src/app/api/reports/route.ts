import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Patient, Therapist, Payment } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/reports?type=revenue&startDate=2026-08-01&endDate=2026-08-08
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const type = url.searchParams.get('type') || 'appointment';
    const startDate = url.searchParams.get('startDate');
    const endDate = url.searchParams.get('endDate');

    const dateFilter: any = {};
    if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    if (type === 'revenue') {
      const payments = await Payment.find({ status: 'paid', ...dateFilter })
        .populate({
          path: 'appointmentId',
          populate: { path: 'patientId serviceId' }
        });

      // Prepare reports rows
      const reportRows = payments.map(p => {
        const appt = p.appointmentId as any;
        return {
          transactionId: p.razorpayPaymentId || 'N/A',
          orderId: p.razorpayOrderId,
          patientName: appt?.patientId?.name || 'Unknown Patient',
          service: appt?.serviceId?.title || 'Unknown Service',
          amount: p.amount,
          date: p.createdAt.toISOString().split('T')[0],
          status: p.status
        };
      });

      return NextResponse.json({ success: true, type, data: reportRows });
    } else if (type === 'appointment') {
      const appointments = await Appointment.find(dateFilter)
        .populate('patientId')
        .populate('serviceId')
        .populate('therapistId');

      const reportRows = appointments.map(a => ({
        appointmentId: a._id,
        patientName: (a.patientId as any)?.name || 'Unknown',
        service: (a.serviceId as any)?.title || 'Unknown',
        therapist: (a.therapistId as any)?.name || 'Unassigned',
        date: a.date,
        time: a.timeSlot,
        type: a.visitType,
        status: a.status
      }));

      return NextResponse.json({ success: true, type, data: reportRows });
    } else if (type === 'therapist') {
      const therapists = await Therapist.find();
      const data = [];
      for (const t of therapists) {
        const totalBookings = await Appointment.countDocuments({ therapistId: t._id });
        const completedBookings = await Appointment.countDocuments({ therapistId: t._id, status: 'completed' });
        
        data.push({
          therapistId: t._id,
          name: t.name,
          email: t.email,
          specialization: t.specialization,
          rating: t.ratingAverage,
          totalAppointments: totalBookings,
          completedAppointments: completedBookings
        });
      }

      return NextResponse.json({ success: true, type, data });
    }

    return NextResponse.json({ error: 'Unsupported report type' }, { status: 400 });
  } catch (error: any) {
    console.error('Error generating report:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
