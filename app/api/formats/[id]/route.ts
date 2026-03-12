import { NextRequest, NextResponse } from 'next/server';
import { getFormats, saveFormats } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formats = await getFormats();
    const format = formats.find((f: any) => f.id === params.id);
    
    if (!format) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(format);
  } catch (error) {
    console.error('Error fetching format:', error);
    return NextResponse.json(
      { error: 'Failed to fetch format' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const formats = await getFormats();
    const index = formats.findIndex((f: any) => f.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }
    
    formats[index] = {
      ...formats[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString()
    };
    
    await saveFormats(formats);
    
    return NextResponse.json(formats[index]);
  } catch (error) {
    console.error('Error updating format:', error);
    return NextResponse.json(
      { error: 'Failed to update format' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formats = await getFormats();
    const index = formats.findIndex((f: any) => f.id === params.id);
    
    if (index === -1) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }
    
    formats.splice(index, 1);
    await saveFormats(formats);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting format:', error);
    return NextResponse.json(
      { error: 'Failed to delete format' },
      { status: 500 }
    );
  }
}
