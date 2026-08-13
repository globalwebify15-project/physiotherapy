import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Patient } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/patients/[id] - Retrieve single patient profile
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const patient = await Patient.findById(id).populate('userId');

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Role check: Only admin or the patient themselves can access
    if (user.role === 'patient' && patient.userId._id.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/patients/[id] - Edit profile details (patient themselves or admin)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const patient = await Patient.findById(id);

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // Role check
    if (user.role === 'patient' && patient.userId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    
    // Update fields selectively
    if (body.name) patient.name = body.name;
    if (body.gender) patient.gender = body.gender;
    if (body.dob) patient.dob = new Date(body.dob);
    if (body.emergencyContact) patient.emergencyContact = body.emergencyContact;
    if (body.savedAddresses) patient.savedAddresses = body.savedAddresses;
    if (body.medicalHistory) patient.medicalHistory = body.medicalHistory;
    if (body.profilePhoto !== undefined) patient.profilePhoto = body.profilePhoto;

    await patient.save();

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error updating patient profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
