import { NextRequest, NextResponse } from 'next/server';
import { getOfferings } from '@/lib/db';
import type { Offering, ErrorResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const offerings = await getOfferings() as Offering[];
    
    // Find offerings that use this flavour
    const usedInOfferings = offerings.filter(offering => 
      offering.primaryFlavourIds?.includes(params.id) ||
      offering.secondaryFlavourIds?.includes(params.id)
    );
    
    const usageData = {
      usageCount: usedInOfferings.length,
      offerings: usedInOfferings.map(offering => ({
        id: offering.id,
        name: offering.publicName,
        formatName: offering.formatId, // Will be resolved to format name in UI
        status: offering.status
      }))
    };
    
    return NextResponse.json(usageData);
  } catch (error) {
    console.error('Error fetching flavour usage:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to fetch flavour usage',
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
