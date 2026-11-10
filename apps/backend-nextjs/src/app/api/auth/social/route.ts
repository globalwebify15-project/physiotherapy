import { NextRequest, NextResponse } from 'next/server';
import { connectDB, User, Patient } from 'database';
import { signAccessToken, signRefreshToken } from '@/utils/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const body = await request.json();
    const { idToken, provider = 'social', email, name, photoUrl, uid } = body;

    let verifiedEmail = email;
    let verifiedName = name;
    let verifiedUid = uid;
    let verifiedPhone: string | null = null;

    // Verify with Firebase Admin if idToken is supplied
    if (idToken) {
      try {
        const { getApps } = await import('firebase-admin/app');
        const { getAuth } = await import('firebase-admin/auth');
        const apps = getApps();
        if (apps.length > 0 && apps[0]) {
          const decoded = await getAuth(apps[0]).verifyIdToken(idToken);
          if (decoded.email) verifiedEmail = decoded.email;
          if (decoded.name) verifiedName = decoded.name;
          if (decoded.uid) verifiedUid = decoded.uid;
          if (decoded.phone_number) {
            verifiedPhone = decoded.phone_number.replace(/^\+91/, '').trim();
          }
        }
      } catch (fbErr) {
        console.warn('[AUTH_SOCIAL] Firebase token verification fallback:', fbErr);
      }
    }

    if (!verifiedUid && !verifiedEmail) {
      return NextResponse.json(
        { error: 'Invalid user credentials provided.' },
        { status: 400 }
      );
    }

    // Determine unique identifier for user record
    const socialIdentifier = verifiedPhone || (verifiedEmail ? verifiedEmail.toLowerCase() : `${provider}_${verifiedUid}`);

    // Try finding existing user by email or social identifier
    let user = null;
    if (verifiedEmail) {
      user = await User.findOne({ email: verifiedEmail.toLowerCase() });
    }
    if (!user) {
      user = await User.findOne({ mobile: socialIdentifier });
    }

    if (!user) {
      user = await User.create({
        mobile: socialIdentifier,
        email: verifiedEmail ? verifiedEmail.toLowerCase() : undefined,
        role: 'patient',
        isActive: true,
      });
    } else if (verifiedEmail && !user.email) {
      user.email = verifiedEmail.toLowerCase();
      await user.save();
    }

    // Check or create patient profile
    let patient = await Patient.findOne({ userId: user._id });
    if (!patient) {
      patient = await Patient.create({
        userId: user._id,
        name: verifiedName && verifiedName.trim().length > 0 ? verifiedName.trim() : 'Valued Patient',
        gender: 'other',
        dob: new Date('2000-01-01'),
        profilePhoto: photoUrl || undefined,
        emergencyContact: {
          name: verifiedName || 'Self',
          phone: verifiedPhone || socialIdentifier,
          relation: 'Self',
        },
        savedAddresses: [],
        medicalHistory: [],
      });
    } else {
      let modified = false;
      if (verifiedName && (!patient.name || patient.name.startsWith('Patient ('))) {
        patient.name = verifiedName.trim();
        modified = true;
      }
      if (photoUrl && !patient.profilePhoto) {
        patient.profilePhoto = photoUrl;
        modified = true;
      }
      if (modified) {
        await patient.save();
      }
    }

    const payload = {
      userId: user._id.toString(),
      mobile: user.mobile,
      role: user.role,
    };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    return NextResponse.json({
      success: true,
      message: 'Social sign-in successful',
      accessToken,
      refreshToken,
      user: {
        id: user._id.toString(),
        mobile: user.mobile,
        email: user.email,
        role: user.role,
      },
      patient: {
        id: patient._id.toString(),
        name: patient.name,
        gender: patient.gender,
        dob: patient.dob,
        profilePhoto: patient.profilePhoto,
        emergencyContact: patient.emergencyContact,
        savedAddresses: patient.savedAddresses,
      },
      isNewUser: !patient.name || patient.name.startsWith('Patient ('),
    });
  } catch (error: any) {
    console.error('[AUTH_SOCIAL_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error during social authentication' },
      { status: 500 }
    );
  }
}

