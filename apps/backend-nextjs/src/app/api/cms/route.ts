import { NextRequest, NextResponse } from 'next/server';
import { connectDB, CMS } from 'database';
import { getAuthenticatedUser } from '@/utils/auth';

// GET /api/cms - Fetch CMS configuration blocks
// Query parameter: ?key=homepage_banners
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const url = new URL(request.url);
    const key = url.searchParams.get('key');

    if (key) {
      const cmsBlock = await CMS.findOne({ key });
      if (!cmsBlock) {
        return NextResponse.json({ error: `CMS configuration for key '${key}' not found` }, { status: 404 });
      }
      return NextResponse.json({ success: true, key, content: cmsBlock.content });
    }

    // Return all if no key specified
    const cmsBlocks = await CMS.find();
    return NextResponse.json({ success: true, cmsBlocks });
  } catch (error: any) {
    console.error('Error fetching CMS:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST/PUT /api/cms - Update CMS config (Admin / Super Admin only)
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    const user = await getAuthenticatedUser(request, ['admin', 'superadmin']);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { key, content } = await request.json();

    if (!key || content === undefined) {
      return NextResponse.json({ error: 'Missing key or content' }, { status: 400 });
    }

    const cmsBlock = await CMS.findOneAndUpdate(
      { key },
      { content, updatedBy: user.userId },
      { new: true, upsert: true } // Create if it doesn't exist
    );

    return NextResponse.json({ success: true, cmsBlock });
  } catch (error: any) {
    console.error('Error updating CMS:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
