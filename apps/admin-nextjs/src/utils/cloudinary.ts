import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import sharp from 'sharp';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'bc4kgc77',
  api_key: process.env.CLOUDINARY_API_KEY || '738945981836422',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'LetbHJxRMkkKMlLJXsMbucoJXjs',
  secure: true,
});

export { cloudinary };

export interface UploadOptions {
  folder?: string;
  publicId?: string;
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  fit?: 'inside' | 'cover' | 'contain' | 'fill';
  position?: string;
}

export interface OptimizedUploadResult {
  url: string;
  publicId: string;
  bytes: number;
  format: string;
  width: number;
  height: number;
}

/**
 * Optimizes an image buffer/base64 to WebP with Sharp, then uploads directly to Cloudinary.
 * Guarantees minimal compressed size and high visual fidelity.
 */
export async function optimizeAndUploadToCloudinary(
  input: Buffer | string,
  options: UploadOptions = {}
): Promise<OptimizedUploadResult> {
  const {
    folder = 'quickphysio24/uploads',
    publicId,
    maxWidth = 1200,
    maxHeight = 1200,
    quality = 80,
    fit = 'inside',
    position = 'top',
  } = options;

  let buffer: Buffer;

  if (typeof input === 'string') {
    if (input.startsWith('https://res.cloudinary.com/')) {
      return {
        url: input,
        publicId: '',
        bytes: 0,
        format: 'webp',
        width: 0,
        height: 0,
      };
    }

    if (input.startsWith('data:image')) {
      const base64Data = input.replace(/^data:image\/\w+;base64,/, '');
      buffer = Buffer.from(base64Data, 'base64');
    } else if (input.startsWith('http://') || input.startsWith('https://')) {
      const res = await fetch(input);
      const arrayBuf = await res.arrayBuffer();
      buffer = Buffer.from(arrayBuf);
    } else {
      buffer = Buffer.from(input, 'base64');
    }
  } else {
    buffer = input;
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('Image buffer is empty.');
  }

  // 1. Optimize & Convert to WebP using Sharp
  let sharpInstance = sharp(buffer)
    .rotate()
    .resize({
      width: maxWidth,
      height: maxHeight,
      fit,
      position: fit === 'cover' ? position : undefined,
      withoutEnlargement: true,
    })
    .webp({
      quality,
      effort: 4,
    });

  const optimizedWebpBuffer = await sharpInstance.toBuffer();

  // 2. Upload to Cloudinary via upload_stream
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        public_id: publicId,
        resource_type: 'image',
        format: 'webp',
        overwrite: true,
      },
      (error, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          return reject(error || new Error('Cloudinary upload returned undefined.'));
        }
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          bytes: result.bytes,
          format: result.format,
          width: result.width,
          height: result.height,
        });
      }
    );

    uploadStream.end(optimizedWebpBuffer);
  });
}

