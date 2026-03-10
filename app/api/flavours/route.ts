import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFlavours, saveFlavours, getIngredients } from '@/lib/db';
import type { Flavour, Ingredient, Allergen, DietaryFlag, PaginatedResponse, ErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination params
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    
    // Filter params
    const search = searchParams.get('search')?.toLowerCase();
    const status = searchParams.get('status');
    const syncStatus = searchParams.get('syncStatus');
    const type = searchParams.get('type');
    const baseStyle = searchParams.get('baseStyle');
    const twistEligible = searchParams.get('twistEligible');
    const pintEligible = searchParams.get('pintEligible');
    const sandwichEligible = searchParams.get('sandwichEligible');
    
    let flavours = await getFlavours() as Flavour[];
    
    // Apply filters
    if (search) {
      flavours = flavours.filter(f => 
        f.name.toLowerCase().includes(search) ||
        f.description?.toLowerCase().includes(search)
      );
    }
    
    if (status) {
      flavours = flavours.filter(f => f.status === status);
    }
    
    if (syncStatus) {
      flavours = flavours.filter(f => f.syncStatus === syncStatus);
    }
    
    if (type) {
      flavours = flavours.filter(f => f.type === type);
    }
    
    if (baseStyle) {
      flavours = flavours.filter(f => f.baseStyle === baseStyle);
    }
    
    if (twistEligible === 'true') {
      flavours = flavours.filter(f => f.canBeUsedInTwist === true);
    }
    
    if (pintEligible === 'true') {
      flavours = flavours.filter(f => f.canBeSoldAsPint === true);
    }
    
    if (sandwichEligible === 'true') {
      flavours = flavours.filter(f => f.canBeUsedInSandwich === true);
    }
    
    // Calculate pagination
    const total = flavours.length;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = flavours.slice(startIndex, endIndex);
    
    const response: PaginatedResponse<Flavour> = {
      data: paginatedData,
      total,
      page,
      pageSize
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching flavours:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch flavours',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const flavours = await getFlavours() as Flavour[];
    
    // Check for duplicate name
    const duplicate = flavours.find(
      f => f.name.toLowerCase() === body.name.toLowerCase()
    );
    
    if (duplicate) {
      const errorResponse: ErrorResponse = {
        error: 'A flavour with this name already exists',
        code: 'DUPLICATE_NAME',
        details: { existingId: duplicate.id },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 409 });
    }
    
    const newFlavour: Flavour = {
      id: Date.now().toString(),
      name: body.name,
      slug: body.slug || body.name.toLowerCase().replace(/\s+/g, '-'),
      description: body.description || '',
      shortDescription: body.shortDescription || '',
      ingredients: body.ingredients || [],
      allergens: body.allergens || [],
      dietaryTags: body.dietaryTags || [],
      
      // New Phase 3 fields
      type: body.type || 'gelato',
      baseStyle: body.baseStyle || 'dairy',
      keyNotes: body.keyNotes || [],
      colour: body.colour || '#FFFFFF',
      season: body.season,
      status: body.status || 'active',
      
      // Format eligibility flags
      canBeUsedInTwist: body.canBeUsedInTwist ?? true,
      canBeSoldAsPint: body.canBeSoldAsPint ?? true,
      canBeUsedInSandwich: body.canBeUsedInSandwich ?? true,
      
      // Admin fields
      sortOrder: body.sortOrder ?? 0,
      featured: body.featured ?? false,
      
      // Shopify integration
      shopifyProductHandle: body.shopifyProductHandle,
      shopifyProductId: body.shopifyProductId,
      syncStatus: body.shopifyProductId ? 'pending' : 'not_linked',
      
      // Optional fields
      story: body.story,
      tastingNotes: body.tastingNotes,
      image: body.image,
      
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    flavours.push(newFlavour);
    await saveFlavours(flavours);
    
    return NextResponse.json(newFlavour, { status: 201 });
  } catch (error) {
    console.error('Error creating flavour:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to create flavour',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
