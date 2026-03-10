import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFormats, saveFormats, getOfferings } from '@/lib/db';
import type { Format, Offering, ErrorResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formats = await getFormats() as Format[];
    const format = formats.find(f => f.id === params.id);
    
    if (!format) {
      const errorResponse: ErrorResponse = {
        error: 'Format not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    return NextResponse.json(format);
  } catch (error) {
    console.error('Error fetching format:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch format',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session) {
    const errorResponse: ErrorResponse = {
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const body = await request.json();
    const formats = await getFormats() as Format[];
    const index = formats.findIndex(f => f.id === params.id);
    
    if (index === -1) {
      const errorResponse: ErrorResponse = {
        error: 'Format not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    // Check for duplicate name (excluding current format)
    const duplicateName = formats.find(
      f => f.id !== params.id && f.name.toLowerCase() === body.name.toLowerCase()
    );
    
    if (duplicateName) {
      const errorResponse: ErrorResponse = {
        error: 'A format with this name already exists',
        code: 'DUPLICATE_NAME',
        details: { existingId: duplicateName.id },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }
    
    // Check for duplicate slug (excluding current format)
    const duplicateSlug = formats.find(
      f => f.id !== params.id && f.slug.toLowerCase() === body.slug.toLowerCase()
    );
    
    if (duplicateSlug) {
      const errorResponse: ErrorResponse = {
        error: 'A format with this slug already exists',
        code: 'DUPLICATE_SLUG',
        details: { existingId: duplicateSlug.id },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }
    
    // Validate slug is URL-safe
    const urlSafeRegex = /^[a-z0-9-]+$/;
    if (!urlSafeRegex.test(body.slug)) {
      const errorResponse: ErrorResponse = {
        error: 'Slug must be URL-safe (lowercase letters, numbers, and hyphens only)',
        code: 'INVALID_SLUG',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Validate minFlavours <= maxFlavours
    if (body.minFlavours > body.maxFlavours) {
      const errorResponse: ErrorResponse = {
        error: 'Minimum flavours must be less than or equal to maximum flavours',
        code: 'INVALID_FLAVOUR_RANGE',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    formats[index] = {
      ...formats[index],
      ...body,
      id: params.id,
      updatedAt: new Date().toISOString(),
    };
    
    await saveFormats(formats);
    
    return NextResponse.json(formats[index]);
  } catch (error) {
    console.error('Error updating format:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to update format',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session) {
    const errorResponse: ErrorResponse = {
      error: 'Unauthorized',
      code: 'AUTH_REQUIRED',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    // Check if format is used in any offerings
    const offerings = await getOfferings() as Offering[];
    const usedInOfferings = offerings.filter(o => o.formatId === params.id);
    
    if (usedInOfferings.length > 0) {
      const errorResponse: ErrorResponse = {
        error: 'Cannot delete format',
        code: 'RESOURCE_IN_USE',
        details: {
          message: `This format is used in ${usedInOfferings.length} offering(s)`,
          offerings: usedInOfferings.map(o => ({ id: o.id, name: o.internalName }))
        },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }
    
    const formats = await getFormats() as Format[];
    const filtered = formats.filter(f => f.id !== params.id);
    
    if (filtered.length === formats.length) {
      const errorResponse: ErrorResponse = {
        error: 'Format not found',
        code: 'NOT_FOUND',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }
    
    await saveFormats(filtered);
    
    return NextResponse.json({ message: 'Format deleted successfully' });
  } catch (error) {
    console.error('Error deleting format:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to delete format',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
