import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Patient } from 'database';
import { signAccessToken, signRefreshToken } from '@/utils/auth';
import { getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const { mobile: inputMobile, otp, idToken } = await request.json();

    let targetMobile = inputMobile;

    // If a Firebase Auth idToken is provided, verify it to extract the authenticated phone number
    if (idToken) {
      try {
        const apps = getApps();
        if (apps.length > 0) {
          const decoded = await getAuth(apps[0]!).verifyIdToken(idToken);
          if (decoded.phone_number) {
            targetMobile = decoded.phone_number.replace(/^\+91/, '');
          }
        }
      } catch (fbErr) {
        console.warn('[AUTH] Firebase idToken verification fallback to input mobile:', fbErr);
      }
    }

    const cleanMobile = (targetMobile || inputMobile || '').replace(/^\+91/, '').trim();
    if (!cleanMobile) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    // Find User matching with or without +91
    let user = await User.findOne({
      $or: [
        { mobile: cleanMobile },
        { mobile: `+91${cleanMobile}` }
      ]
    });

    if (!user) {
      user = await User.create({
        mobile: cleanMobile,
        role: 'patient',
        isActive: true,
      });
    }

    // Check if Patient profile exists
    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      // Also check if existing patient matches phone number
      patient = await Patient.findOne({
        $or: [
          { 'emergencyContact.phone': cleanMobile },
          { 'emergencyContact.phone': `+91${cleanMobile}` },
          { savedAddresses: { $elemMatch: { phone: cleanMobile } } },
        ]
      });
      if (patient) {
        patient.userId = user._id;
        await patient.save();
      } else {
        // Create skeleton patient profile
        patient = await Patient.create({
          userId: user._id,
          name: `Patient (${cleanMobile.slice(-4)})`,
          gender: 'other',
          dob: new Date('2000-01-01'),
          emergencyContact: {
            name: 'Self',
            phone: cleanMobile,
            relation: 'Self',
          },
          savedAddresses: [],
          medicalHistory: [],
        });
      }
    }

    // Determine if user has already onboarded / filled details
    const hasCompletedProfile = patient &&
      patient.name &&
      !patient.name.startsWith('Patient (') &&
      patient.name.trim().toLowerCase() !== 'patient';

    const isNewUser = !hasCompletedProfile;

    // Generate JWT payload
    const payload = {
      userId: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const primaryAddress = (patient.savedAddresses && patient.savedAddresses.length > 0)
      ? patient.savedAddresses[0].addressLine
      : '';

    return NextResponse.json({
      success: true,
      accessToken,
      refreshToken,
      isNewUser,
      user: {
        id: user._id,
        mobile: user.mobile,
        role: user.role,
      },
      patient: {
        id: patient._id,
        name: patient.name,
        gender: patient.gender,
        dob: patient.dob,
        emergencyContact: patient.emergencyContact,
        savedAddresses: patient.savedAddresses,
        address: primaryAddress,
        medicalHistory: patient.medicalHistory,
      },
    });
  } catch (error: any) {
    console.error('Error verifying OTP:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
