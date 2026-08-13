import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Therapist } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/therapists - Retrieve active therapists
export async function GET() {
  try {
    await connectDB();
    const therapists = await Therapist.find({ isActive: true });
    return NextResponse.json({ success: true, therapists });
  } catch (error: any) {
    console.error('Error fetching therapists:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/therapists - Onboard a therapist (Admin / Super Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, mobile, profilePhoto, qualification, experience, specialization, workingHours, workingDays } = body;

    if (!name || !email || !mobile || !qualification) {
      return NextResponse.json({ error: 'Missing required therapist fields' }, { status: 400 });
    }

    const therapist = await Therapist.create({
      name,
      email,
      mobile,
      profilePhoto: profilePhoto || '',
      qualification,
      experience: experience || 0,
      specialization: specialization || [],
      workingHours: workingHours || { start: '09:00', end: '18:00' },
      workingDays: workingDays || [1, 2, 3, 4, 5],
      isActive: true,
    });

    return NextResponse.json({ success: true, therapist }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating therapist:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Therapist with this email or mobile already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
