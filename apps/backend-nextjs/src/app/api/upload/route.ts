import { NextRequest, NextResponse } from 'next/server';
import { optimizeAndUploadToCloudinary } from '@/utils/cloudinary';

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let folder = 'quickphysio24/uploads';
    let fileBuffer: Buffer | null = null;
    let base64String: string | null = null;
    let maxWidth = 1200;
    let maxHeight = 1200;
    let quality = 80;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = (formData.get('file') || formData.get('image')) as File | null;
      const requestedFolder = formData.get('folder') as string | null;
      if (requestedFolder) folder = `quickphysio24/${requestedFolder.replace(/^quickphysio24\/?/, '')}`;

      if (!file || file.size === 0) {
        return NextResponse.json({ error: 'No image file uploaded.' }, { status: 400 });
      }

      const arrayBuf = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuf);
    } else {
      // JSON body
      const body = await request.json();
      const { image, file, folder: reqFolder, width, height, quality: reqQ } = body;
      if (reqFolder) folder = `quickphysio24/${reqFolder.replace(/^quickphysio24\/?/, '')}`;
      if (width) maxWidth = Number(width);
      if (height) maxHeight = Number(height);
      if (reqQ) quality = Number(reqQ);

      const payload = image || file;
      if (!payload || typeof payload !== 'string') {
        return NextResponse.json({ error: 'Missing image string or base64.' }, { status: 400 });
      }

      base64String = payload;
    }

    const input = fileBuffer || base64String;
    if (!input) {
      return NextResponse.json({ error: 'Empty image payload.' }, { status: 400 });
    }

    const result = await optimizeAndUploadToCloudinary(input, {
      folder,
      maxWidth,
      maxHeight,
      quality,
      fit: 'inside',
    });

    return NextResponse.json({
      success: true,
      url: result.url,
      publicId: result.publicId,
      bytes: result.bytes,
      format: result.format,
      width: result.width,
      height: result.height,
    });
  } catch (error: any) {
    console.error('[API /upload Error]:', error);
    return NextResponse.json(
      { error: 'Image upload failed', details: error.message || String(error) },
      { status: 500 }
    );
  }
}

