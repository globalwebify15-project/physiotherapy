import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Appointment, Therapist } from 'database';

const DEFAULT_SLOTS = [
  '09:00', '10:00', '11:00', '12:00', '13:00', 
  '14:00', '15:00', '16:00', '17:00', '18:00'
];

// GET /api/appointments/slots?date=2026-08-08&therapistId=XYZ
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const therapistId = url.searchParams.get('therapistId');

    if (!date) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const bookingDate = new Date(date);
    const dayOfWeek = bookingDate.getDay(); // 0 (Sun) - 6 (Sat)

    if (therapistId) {
      // 1. Specific therapist slot check
      const therapist = await Therapist.findById(therapistId);
      if (!therapist || !therapist.isActive) {
        return NextResponse.json({ error: 'Therapist not found or inactive' }, { status: 404 });
      }

      // Check if they work on this day of the week
      if (!therapist.workingDays.includes(dayOfWeek)) {
        return NextResponse.json({ success: true, slots: [] });
      }

      // Find already booked slots
      const bookings = await Appointment.find({
        therapistId,
        date,
        status: { $ne: 'cancelled' }
      });

      const bookedSlots = bookings.map(b => b.timeSlot);
      
      // Filter slots based on working hours and current bookings
      const startHour = parseInt(therapist.workingHours.start.split(':')[0]);
      const endHour = parseInt(therapist.workingHours.end.split(':')[0]);

      const availableSlots = DEFAULT_SLOTS.filter(slot => {
        const slotHour = parseInt(slot.split(':')[0]);
        // Slot must fall within working hours and not be booked
        return slotHour >= startHour && slotHour < endHour && !bookedSlots.includes(slot);
      });

      return NextResponse.json({ success: true, slots: availableSlots });
    } else {
      // 2. Generic slot check (at least one therapist must be free)
      const therapists = await Therapist.find({ isActive: true });
      
      // Filter therapists that work on this day
      const workingTherapists = therapists.filter(t => t.workingDays.includes(dayOfWeek));

      if (workingTherapists.length === 0) {
        return NextResponse.json({ success: true, slots: [] });
      }

      // Find all bookings on this day
      const bookings = await Appointment.find({
        date,
        status: { $ne: 'cancelled' },
        therapistId: { $exists: true }
      });

      // Map out bookings by slot: { slot: [therapistId1, therapistId2] }
      const slotBookings: { [slot: string]: string[] } = {};
      bookings.forEach(b => {
        if (b.therapistId) {
          const tIdStr = b.therapistId.toString();
          if (!slotBookings[b.timeSlot]) {
            slotBookings[b.timeSlot] = [];
          }
          slotBookings[b.timeSlot].push(tIdStr);
        }
      });

      // A slot is available if there is at least one therapist who works on this day AND is not booked for this slot
      const availableSlots = DEFAULT_SLOTS.filter(slot => {
        return workingTherapists.some(t => {
          const startHour = parseInt(t.workingHours.start.split(':')[0]);
          const endHour = parseInt(t.workingHours.end.split(':')[0]);
          const slotHour = parseInt(slot.split(':')[0]);

          const isWorking = slotHour >= startHour && slotHour < endHour;
          const isBooked = slotBookings[slot] && slotBookings[slot].includes(t._id.toString());

          return isWorking && !isBooked;
        });
      });

      return NextResponse.json({ success: true, slots: availableSlots });
    }
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
