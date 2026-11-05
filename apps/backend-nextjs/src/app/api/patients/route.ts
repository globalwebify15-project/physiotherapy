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
      const clean = mobileParam.replace(/^\+91|\D/g, '').trim();
      const dbUser = await User.findOne({
        $or: [
          { mobile: clean },
          { mobile: `+91${clean}` },
          { mobile: mobileParam },
          { mobile: { $regex: clean, $options: 'i' } }
        ]
      });
      if (dbUser) targetUserId = dbUser._id;
    }

    if (user?.role === 'patient' || targetUserId || mobileParam) {
      let patient = targetUserId ? await Patient.findOne({ userId: targetUserId }).populate('userId') : null;
      if (!patient && mobileParam) {
        const clean = mobileParam.replace(/^\+91|\D/g, '').trim();
        patient = await Patient.findOne({
          $or: [
            { 'emergencyContact.phone': clean },
            { 'emergencyContact.phone': `+91${clean}` },
            { 'emergencyContact.phone': { $regex: clean } },
            { savedAddresses: { $elemMatch: { phone: clean } } },
          ]
        }).populate('userId');
      }
      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
      }
      const populatedPatient = await Patient.findById(patient._id).populate('userId');
      return NextResponse.json({ success: true, patient: populatedPatient || patient });
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
    const { name, gender, dob, emergencyContact, savedAddresses, medicalHistory, mobile, address, profilePhoto, email } = body;

    let targetUserId = user?.userId;
    let foundUser: any = null;

    if (targetUserId) {
      foundUser = await User.findById(targetUserId);
    }

    if (!foundUser && mobile) {
      const clean = mobile.replace(/^\+91|\D/g, '').trim();
      foundUser = await User.findOne({
        $or: [{ mobile: clean }, { mobile: `+91${clean}` }, { mobile }, { mobile: { $regex: clean } }]
      });
      if (!foundUser && clean.length >= 10) {
        foundUser = await User.create({ mobile: `+91${clean}`, role: 'patient', isActive: true });
      }
      if (foundUser) {
        targetUserId = foundUser._id;
      }
    }

    if (!targetUserId) {
      return NextResponse.json({ error: 'Unauthorized or missing mobile identifier' }, { status: 401 });
    }

    // Sync email and name on User model
    if (foundUser) {
      let userUpdated = false;
      if (email && email.trim() && foundUser.email !== email.trim()) {
        foundUser.email = email.trim();
        userUpdated = true;
      }
      if (name && name.trim() && foundUser.name !== name.trim()) {
        foundUser.name = name.trim();
        userUpdated = true;
      }
      if (userUpdated) {
        await foundUser.save();
      }
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
      if (profilePhoto !== undefined) patient.profilePhoto = profilePhoto;
      await patient.save();
    } else {
      patient = await Patient.create({
        userId: targetUserId,
        name: name || 'Patient',
        gender: gender || 'other',
        dob: dob ? new Date(dob) : new Date('2000-01-01'),
        profilePhoto: profilePhoto || '',
        emergencyContact: emergencyContact || {
          name: 'Self',
          phone: mobile || '',
          relation: 'Self'
        },
        savedAddresses: formattedAddresses,
        medicalHistory: medicalHistory || []
      });
    }

    const populatedPatient = await Patient.findById(patient._id).populate('userId');
      return NextResponse.json({ success: true, patient: populatedPatient || patient });
  } catch (error: any) {
    console.error('Error saving patient profile:', error);
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
