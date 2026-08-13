import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Patient, Appointment, Therapist, Payment } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/dashboard - Retrieve aggregated stats for admin dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin', 'receptionist']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const todayStr = new Date().toISOString().split('T')[0];

    // 1. Core KPIs
    const totalPatients = await Patient.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    const dailyAppointments = await Appointment.countDocuments({ date: todayStr });
    
    // Revenue calculations (paid payments)
    const paidPayments = await Payment.find({ status: 'paid' });
    const revenue = paidPayments.reduce((sum, p) => sum + p.amount, 0);

    const activeTherapists = await Therapist.countDocuments({ isActive: true });

    // 2. Booking trend charts (past 7 days including today)
    const chartsData = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = await Appointment.countDocuments({ date: dateStr });
      
      const dayPayments = await Payment.find({
        status: 'paid',
        createdAt: {
          $gte: new Date(dateStr + 'T00:00:00.000Z'),
          $lte: new Date(dateStr + 'T23:59:59.999Z')
        }
      });
      const dayRevenue = dayPayments.reduce((sum, p) => sum + p.amount, 0);

      chartsData.push({
        date: dateStr,
        bookings: count,
        revenue: dayRevenue
      });
    }

    // 3. Recent bookings
    const recentAppointments = await Appointment.find()
      .populate('patientId')
      .populate('serviceId')
      .populate('therapistId')
      .sort({ createdAt: -1 })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalPatients,
        totalAppointments,
        dailyAppointments,
        revenue,
        activeTherapists,
      },
      charts: chartsData,
      recentAppointments
    });
  } catch (error: any) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
