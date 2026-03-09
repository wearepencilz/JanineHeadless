import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.` },
        { status: 400 }
      );
    }

    // Check if we're in production with Vercel Blob
    const hasVercelBlob = process.env.BLOB_READ_WRITE_TOKEN;

    if (hasVercelBlob) {
      // Try Vercel Blob first
      try {
        const { put } = await import('@vercel/blob');
        const blob = await put(file.name, file, {
          access: 'public',
        });
        console.log('✓ Uploaded to Vercel Blob:', blob.url);
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.warn('⚠ Vercel Blob upload failed, falling back to local storage:', blobError.message);
        // Fall through to local storage
      }
    }

    // Development or Blob fallback: Save to local public/uploads directory
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create unique filename with timestamp
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const filepath = path.join(process.cwd(), 'public', 'uploads', filename);

    await writeFile(filepath, buffer);
    
    const url = `/uploads/${filename}`;
    console.log('✓ File saved locally:', url);
    
    return NextResponse.json({ url });
  } catch (error: any) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
