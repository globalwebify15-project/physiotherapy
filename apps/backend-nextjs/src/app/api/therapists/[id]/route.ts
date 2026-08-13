import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Therapist } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/therapists/[id] - Retrieve single therapist details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    const therapist = await Therapist.findById(id);

    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, therapist });
  } catch (error: any) {
    console.error('Error fetching therapist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/therapists/[id] - Update therapist profile (Admin / Super Admin only)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const therapist = await Therapist.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, therapist });
  } catch (error: any) {
    console.error('Error updating therapist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/therapists/[id] - Soft delete/deactivate therapist (Admin / Super Admin only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const therapist = await Therapist.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!therapist) {
      return NextResponse.json({ error: 'Therapist not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Therapist deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating therapist:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
