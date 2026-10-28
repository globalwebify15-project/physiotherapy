import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { connectDB, Appointment, Therapist } from 'database';

interface SlotDefinition {
  label12: string; // "09:00 AM"
  value24: string; // "09:00"
  hour: number;    // 9
}

const DEFAULT_SLOTS: SlotDefinition[] = [
  { label12: '09:00 AM', value24: '09:00', hour: 9 },
  { label12: '10:00 AM', value24: '10:00', hour: 10 },
  { label12: '11:00 AM', value24: '11:00', hour: 11 },
  { label12: '12:00 PM', value24: '12:00', hour: 12 },
  { label12: '01:00 PM', value24: '13:00', hour: 13 },
  { label12: '02:00 PM', value24: '14:00', hour: 14 },
  { label12: '03:00 PM', value24: '15:00', hour: 15 },
  { label12: '04:00 PM', value24: '16:00', hour: 16 },
  { label12: '05:00 PM', value24: '17:00', hour: 17 },
  { label12: '06:00 PM', value24: '18:00', hour: 18 },
];

function normalizeSlotHour(slot: string): number | null {
  if (!slot) return null;
  const s = slot.trim().toUpperCase();
  const m = s.match(/(\d+):(\d+)\s*(AM|PM)?/);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const ampm = m[3];
  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0;
  return hour;
}

// GET /api/appointments/slots?date=2026-08-08&therapistId=XYZ
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const date = url.searchParams.get('date');
    const rawTherapistId = url.searchParams.get('therapistId');

    if (!date) {
      return NextResponse.json({ error: 'Date is required (YYYY-MM-DD)' }, { status: 400 });
    }

    const bookingDate = new Date(date + 'T00:00:00Z');
    const dayOfWeek = bookingDate.getUTCDay(); // 0 (Sun) - 6 (Sat)

    if (rawTherapistId && rawTherapistId !== 'all') {
      // 1. Specific therapist slot check (handles ObjectId or name alias)
      let therapist = null;
      if (mongoose.Types.ObjectId.isValid(rawTherapistId)) {
        therapist = await Therapist.findById(rawTherapistId);
      } else {
        const isPriyanka = rawTherapistId.toLowerCase().includes('priyanka');
        therapist = await Therapist.findOne({
          name: new RegExp(isPriyanka ? 'Priyanka' : 'Rajnish', 'i'),
          isActive: true,
        });
      }

      if (!therapist || !therapist.isActive) {
        return NextResponse.json({ error: 'Therapist not found or inactive' }, { status: 404 });
      }

      // Check if therapist works on this day
      const workingDays = therapist.workingDays || [0, 1, 2, 3, 4, 5, 6];
      if (!workingDays.includes(dayOfWeek)) {
        return NextResponse.json({ 
          success: true, 
          slots: [], 
          availableLabels: [],
          bookedLabels: [],
          workingHours: therapist.workingHours 
        });
      }

      // Find all non-cancelled bookings for this therapist on this date
      const bookings = await Appointment.find({
        therapistId: therapist._id,
        date,
        status: { $ne: 'cancelled' },
      });

      const bookedHours = new Set(
        bookings.map((b) => normalizeSlotHour(b.timeSlot)).filter((h): h is number => h !== null)
      );

      const startHour = parseInt((therapist.workingHours?.start || '09:00').split(':')[0], 10);
      const endHour = parseInt((therapist.workingHours?.end || '19:00').split(':')[0], 10);

      const availableSlots: string[] = [];
      const availableLabels: string[] = [];
      const bookedLabels: string[] = [];

      for (const slot of DEFAULT_SLOTS) {
        const isWithinHours = slot.hour >= startHour && slot.hour < endHour;
        const isBooked = bookedHours.has(slot.hour);

        if (isWithinHours && !isBooked) {
          availableSlots.push(slot.value24);
          availableLabels.push(slot.label12);
        } else if (isBooked) {
          bookedLabels.push(slot.label12);
        }
      }

      return NextResponse.json({
        success: true,
        slots: availableLabels, // Default to 12-hour labels ("10:00 AM")
        available24: availableSlots,
        availableLabels,
        bookedLabels,
        therapist: {
          id: therapist._id.toString(),
          name: therapist.name,
        },
      });
    } else {
      // 2. Generic slot check across all active practitioners
      const therapists = await Therapist.find({ isActive: true });
      const workingTherapists = therapists.filter((t) => {
        const days = t.workingDays || [0, 1, 2, 3, 4, 5, 6];
        return days.includes(dayOfWeek);
      });

      if (workingTherapists.length === 0) {
        return NextResponse.json({ success: true, slots: [], availableLabels: [], bookedLabels: [] });
      }

      const bookings = await Appointment.find({
        date,
        status: { $ne: 'cancelled' },
        therapistId: { $exists: true },
      });

      // Map { hour: Set<therapistId> }
      const hourBookings = new Map<number, Set<string>>();
      for (const b of bookings) {
        if (!b.therapistId) continue;
        const h = normalizeSlotHour(b.timeSlot);
        if (h === null) continue;
        if (!hourBookings.has(h)) hourBookings.set(h, new Set());
        hourBookings.get(h)!.add(b.therapistId.toString());
      }

      const availableLabels: string[] = [];
      const availableSlots: string[] = [];
      const bookedLabels: string[] = [];

      for (const slot of DEFAULT_SLOTS) {
        const hasFreeDoctor = workingTherapists.some((t) => {
          const startHour = parseInt((t.workingHours?.start || '09:00').split(':')[0], 10);
          const endHour = parseInt((t.workingHours?.end || '19:00').split(':')[0], 10);
          const isWorking = slot.hour >= startHour && slot.hour < endHour;
          const bookedDocs = hourBookings.get(slot.hour);
          const isBookedForThisDoc = bookedDocs && bookedDocs.has(t._id.toString());
          return isWorking && !isBookedForThisDoc;
        });

        if (hasFreeDoctor) {
          availableLabels.push(slot.label12);
          availableSlots.push(slot.value24);
        } else {
          bookedLabels.push(slot.label12);
        }
      }

      return NextResponse.json({
        success: true,
        slots: availableLabels,
        available24: availableSlots,
        availableLabels,
        bookedLabels,
      });
    }
  } catch (error: any) {
    console.error('Error fetching available slots:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
