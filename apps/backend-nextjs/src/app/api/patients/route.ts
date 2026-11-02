import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Patient, User } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/patients - Fetch patient list (Admin/Staff) or specific patient profile
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request);
    const url = new URL(request.url);
    const mobileParam = url.searchParams.get('mobile');

    let targetUserId = user?.userId;

    if (!targetUserId && mobileParam) {
      const clean = mobileParam.replace(/^\+91/, '').trim();
      const dbUser = await User.findOne({
        $or: [{ mobile: clean }, { mobile: `+91${clean}` }, { mobile: mobileParam }]
      });
      if (dbUser) targetUserId = dbUser._id;
    }

    if (user?.role === 'patient' || targetUserId) {
      const patient = await Patient.findOne({ userId: targetUserId }).populate('userId');
      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, patient });
    }

    // Admin / Staff search and filter
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
    const body = await request.json();
    const { name, gender, dob, emergencyContact, savedAddresses, medicalHistory, mobile, address } = body;

    let targetUserId = user?.userId;

    if (!targetUserId && mobile) {
      const clean = mobile.replace(/^\+91/, '').trim();
      let dbUser = await User.findOne({
        $or: [{ mobile: clean }, { mobile: `+91${clean}` }, { mobile }]
      });
      if (!dbUser && clean.length >= 10) {
        dbUser = await User.create({ mobile: clean, role: 'patient', isActive: true });
      }
      if (dbUser) {
        targetUserId = dbUser._id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized or missing mobile identifier' }, { status: 401 });
    }

    const formattedAddresses = (savedAddresses && savedAddresses.length > 0)
      ? savedAddresses
      : (address ? [{ label: 'Home', addressLine: address, isDefault: true }] : []);

    // Check if patient profile already exists
    let patient = await Patient.findOne({ userId: targetUserId });
    if (patient) {
      if (name) patient.name = name;
      if (gender) patient.gender = gender;
      if (dob) patient.dob = new Date(dob);
      if (emergencyContact) patient.emergencyContact = emergencyContact;
      if (formattedAddresses.length > 0) patient.savedAddresses = formattedAddresses;
      if (medicalHistory) patient.medicalHistory = medicalHistory;
      await patient.save();
    } else {
      patient = await Patient.create({
        userId: targetUserId,
        name: name || 'Patient',
        gender: gender || 'other',
        dob: dob ? new Date(dob) : new Date('2000-01-01'),
        emergencyContact: emergencyContact || {
          name: 'Self',
          phone: mobile || '',
          relation: 'Self'
        },
        savedAddresses: formattedAddresses,
        medicalHistory: medicalHistory || []
      });
    }

    return NextResponse.json({ success: true, patient });
  } catch (error: any) {
    console.error('Error saving patient profile:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
