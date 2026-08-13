import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Service } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

interface RouteContext {
  params: Promise<{ id: string }>;
}

// GET /api/services/[id] - Retrieve single service details
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const { id } = await params;
    const service = await Service.findById(id);

    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Error fetching service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/services/[id] - Update service (Admin / Super Admin only)
export async function PUT(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const service = await Service.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, service });
  } catch (error: any) {
    console.error('Error updating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/services/[id] - Soft delete/deactivate service (Admin / Super Admin only)
export async function DELETE(request: NextRequest, { params }: RouteContext) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const service = await Service.findByIdAndUpdate(id, { isActive: false }, { new: true });
    
    if (!service) {
      return NextResponse.json({ error: 'Service not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Service deactivated successfully' });
  } catch (error: any) {
    console.error('Error deactivating service:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
