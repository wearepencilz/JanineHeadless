import { NextResponse } from 'next/server';
import { getFlavours, saveFlavours } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flavours = await getFlavours();
    const flavour = flavours.find((f: any) => f.id === params.id);
    
    if (!flavour) {
      return NextResponse.json({ error: 'Flavour not found' }, { status: 404 });
    }
    
    return NextResponse.json(flavour);
  } catch (error) {
    console.error('Error fetching flavour:', error);
    return NextResponse.json({ error: 'Failed to fetch flavour' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const flavours = await getFlavours();
    const index = flavours.findIndex((f: any) => f.id === params.id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Flavour not found' }, { status: 404 });
    }
    
    flavours[index] = {
      ...flavours[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };
    
    await saveFlavours(flavours);
    
    return NextResponse.json(flavours[index]);
  } catch (error) {
    console.error('Error updating flavour:', error);
    return NextResponse.json({ error: 'Failed to update flavour' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const flavours = await getFlavours();
    const filtered = flavours.filter((f: any) => f.id !== params.id);
    
    if (filtered.length === flavours.length) {
      return NextResponse.json({ error: 'Flavour not found' }, { status: 404 });
    }
    
    await saveFlavours(filtered);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting flavour:', error);
    return NextResponse.json({ error: 'Failed to delete flavour' }, { status: 500 });
  }
}
