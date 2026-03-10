import { NextRequest, NextResponse } from 'next/server';
import { getOfferings, saveOfferings, getFormats } from '@/lib/db';
import { Offering } from '@/types';

// GET /api/offerings/[id] - Get offering by ID
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerings = await getOfferings();
    const offering = offerings.find((o: Offering) => o.id === params.id);

    if (!offering) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(offering);
  } catch (error) {
    console.error('Error fetching offering:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offering' },
      { status: 500 }
    );
  }
}

// PUT /api/offerings/[id] - Update offering with validation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const offerings = await getOfferings();
    const index = offerings.findIndex((o: Offering) => o.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      );
    }

    // If formatId is being changed, validate the new format
    if (body.formatId && body.formatId !== offerings[index].formatId) {
      const formats = await getFormats();
      const format = formats.find((f: any) => f.id === body.formatId);
      if (!format) {
        return NextResponse.json(
          { error: 'Format not found' },
          { status: 404 }
        );
      }

      // Validate format constraints
      const primaryFlavourIds = body.primaryFlavourIds || offerings[index].primaryFlavourIds;
      
      if (format.requiresFlavours) {
        if (primaryFlavourIds.length < format.minFlavours) {
          return NextResponse.json(
            { error: `Format requires at least ${format.minFlavours} flavour(s)` },
            { status: 400 }
          );
        }
        if (primaryFlavourIds.length > format.maxFlavours) {
          return NextResponse.json(
            { error: `Format allows maximum ${format.maxFlavours} flavour(s)` },
            { status: 400 }
          );
        }
      }
    }

    // Update offering
    const updatedOffering: Offering = {
      ...offerings[index],
      ...body,
      id: params.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    offerings[index] = updatedOffering;
    await saveOfferings(offerings);

    return NextResponse.json(updatedOffering);
  } catch (error) {
    console.error('Error updating offering:', error);
    return NextResponse.json(
      { error: 'Failed to update offering' },
      { status: 500 }
    );
  }
}

// DELETE /api/offerings/[id] - Delete offering
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerings = await getOfferings();
    const index = offerings.findIndex((o: Offering) => o.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Offering not found' },
        { status: 404 }
      );
    }

    offerings.splice(index, 1);
    await saveOfferings(offerings);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting offering:', error);
    return NextResponse.json(
      { error: 'Failed to delete offering' },
      { status: 500 }
    );
  }
}
