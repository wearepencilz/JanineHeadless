import { NextRequest, NextResponse } from 'next/server';
import { getOfferings, saveOfferings } from '@/lib/db';
import { getFormats } from '@/lib/db';
import { Offering, OfferingStatus } from '@/types';

// GET /api/offerings - List offerings with filters
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') as OfferingStatus | null;
    const formatId = searchParams.get('formatId');
    const tags = searchParams.get('tags')?.split(',').filter(Boolean);

    let offerings = await getOfferings();

    // Apply filters
    if (status) {
      offerings = offerings.filter((o: Offering) => o.status === status);
    }

    if (formatId) {
      offerings = offerings.filter((o: Offering) => o.formatId === formatId);
    }

    if (tags && tags.length > 0) {
      offerings = offerings.filter((o: Offering) =>
        tags.some(tag => o.tags.includes(tag))
      );
    }

    return NextResponse.json(offerings);
  } catch (error) {
    console.error('Error fetching offerings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch offerings' },
      { status: 500 }
    );
  }
}

// POST /api/offerings - Create offering with format validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.internalName || !body.publicName || !body.formatId) {
      return NextResponse.json(
        { error: 'Missing required fields: internalName, publicName, formatId' },
        { status: 400 }
      );
    }

    // Validate format exists
    const formats = await getFormats();
    const format = formats.find((f: any) => f.id === body.formatId);
    if (!format) {
      return NextResponse.json(
        { error: 'Format not found' },
        { status: 404 }
      );
    }

    // Validate format constraints
    const primaryFlavourIds = body.primaryFlavourIds || [];
    
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

    // Create offering
    const offerings = await getOfferings();
    
    const newOffering: Offering = {
      id: Date.now().toString(),
      internalName: body.internalName,
      publicName: body.publicName,
      slug: body.slug || body.publicName.toLowerCase().replace(/\s+/g, '-'),
      status: body.status || 'draft',
      formatId: body.formatId,
      primaryFlavourIds: primaryFlavourIds,
      secondaryFlavourIds: body.secondaryFlavourIds || [],
      componentIds: body.componentIds || [],
      description: body.description || '',
      shortCardCopy: body.shortCardCopy || '',
      image: body.image,
      price: body.price || 0,
      compareAtPrice: body.compareAtPrice,
      availabilityStart: body.availabilityStart,
      availabilityEnd: body.availabilityEnd,
      location: body.location,
      tags: body.tags || [],
      shopifyProductId: body.shopifyProductId,
      shopifySKU: body.shopifySKU,
      posMapping: body.posMapping,
      inventoryTracked: body.inventoryTracked || false,
      inventoryQuantity: body.inventoryQuantity,
      batchCode: body.batchCode,
      restockDate: body.restockDate,
      shelfLifeNotes: body.shelfLifeNotes,
      onlineOrderable: body.onlineOrderable !== false,
      pickupOnly: body.pickupOnly || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    offerings.push(newOffering);
    await saveOfferings(offerings);

    return NextResponse.json(newOffering, { status: 201 });
  } catch (error) {
    console.error('Error creating offering:', error);
    return NextResponse.json(
      { error: 'Failed to create offering' },
      { status: 500 }
    );
  }
}
