import { NextRequest, NextResponse } from 'next/server';
import { getOfferings } from '@/lib/db';
import { getFormats } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const flavourId = params.id;
    
    // Get all offerings
    const offerings = await getOfferings();
    
    // Get all formats for name lookup
    const formats = await getFormats();
    const formatMap = new Map(formats.map((f: any) => [f.id, f]));
    
    // Find offerings that use this flavour
    const usageOfferings = offerings
      .filter(offering => 
        offering.primaryFlavourIds?.includes(flavourId)
      )
      .map(offering => {
        const format = formatMap.get(offering.formatId);
        return {
          id: offering.id,
          name: offering.publicName || offering.internalName,
          formatName: format?.name || 'Unknown Format',
          status: offering.status || 'draft',
        };
      });
    
    return NextResponse.json({
      usageCount: usageOfferings.length,
      offerings: usageOfferings,
    });
  } catch (error) {
    console.error('Error fetching flavour usage:', error);
    return NextResponse.json(
      { error: 'Failed to fetch flavour usage' },
      { status: 500 }
    );
  }
}
