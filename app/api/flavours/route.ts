import { NextResponse } from 'next/server';
import { getFlavours, saveFlavours } from '@/lib/db';

export async function GET() {
  try {
    const flavours = await getFlavours();
    return NextResponse.json(flavours);
  } catch (error) {
    console.error('Error fetching flavours:', error);
    return NextResponse.json({ error: 'Failed to fetch flavours' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const flavours = await getFlavours();
    
    const newFlavour = {
      id: Date.now().toString(),
      ...body,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    flavours.push(newFlavour);
    await saveFlavours(flavours);
    
    return NextResponse.json(newFlavour, { status: 201 });
  } catch (error) {
    console.error('Error creating flavour:', error);
    return NextResponse.json({ error: 'Failed to create flavour' }, { status: 500 });
  }
}
