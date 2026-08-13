import { NextRequest, NextResponse } from 'next/server';
import { connectDB, Service } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/services - Retrieve active services
export async function GET() {
  try {
    await connectDB();
    const services = await Service.find({ isActive: true });
    return NextResponse.json({ success: true, services });
  } catch (error: any) {
    console.error('Error fetching services:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/services - Create service (Admin / Super Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, category, duration, pricingClinic, pricingHome, homeVisitAvailable, clinicVisitAvailable, images } = body;

    if (!title || !description || !category || !pricingClinic || !pricingHome) {
      return NextResponse.json({ error: 'Missing required service fields' }, { status: 400 });
    }

    const service = await Service.create({
      title,
      description,
      category,
      duration: duration || 45,
      pricingClinic,
      pricingHome,
      homeVisitAvailable: homeVisitAvailable !== undefined ? homeVisitAvailable : true,
      clinicVisitAvailable: clinicVisitAvailable !== undefined ? clinicVisitAvailable : true,
      images: images || [],
      isActive: true,
    });

    return NextResponse.json({ success: true, service }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating service:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'A service with this title already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
