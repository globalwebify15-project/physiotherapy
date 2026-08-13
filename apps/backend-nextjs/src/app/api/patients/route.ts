import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Patient } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/patients - Fetch patient list (Admin/Staff only) or logged-in patient profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (user.role === 'patient') {
      const patient = await Patient.findOne({ userId: user.userId }).populate('userId');
      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, patient });
    }

    // Admin / Staff search and filter
    const url = new URL(request.url);
    const search = url.searchParams.get('search');
    const filter: any = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } }
      ];
    }

    const patients = await Patient.find(filter).populate('userId').sort({ name: 1 });
    return NextResponse.json({ success: true, patients });
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/patients - Complete profile onboarding or initial creation
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { name, gender, dob, emergencyContact, savedAddresses, medicalHistory } = body;

    if (!name || !gender || !dob || !emergencyContact) {
      return NextResponse.json({ error: 'Missing profile parameters (name, gender, dob, emergencyContact)' }, { status: 400 });
    }

    // Check if patient profile already exists
    let patient = await Patient.findOne({ userId: user.userId });
    if (patient) {
      // Update existing profile
      patient.name = name;
      patient.gender = gender;
      patient.dob = new Date(dob);
      patient.emergencyContact = emergencyContact;
      if (savedAddresses) patient.savedAddresses = savedAddresses;
      if (medicalHistory) patient.medicalHistory = medicalHistory;
      await patient.save();
    } else {
      // Create new profile
      patient = await Patient.create({
        userId: user.userId,
        name,
        gender,
        dob: new Date(dob),
        emergencyContact,
        savedAddresses: savedAddresses || [],
        medicalHistory: medicalHistory || []
      });
    }

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error saving patient profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
