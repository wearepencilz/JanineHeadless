import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFlavours, getFormats, getProducts, saveProducts, getLaunches, saveLaunches } from '@/lib/db';
import { generateProductName } from '@/lib/validation';
import { isFormatEligibleForFlavour, isFormatEligibleForFlavours } from '@/lib/product-generation';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { flavourIds } = await request.json();

    if (!Array.isArray(flavourIds) || flavourIds.length === 0) {
      return NextResponse.json(
        { error: 'flavourIds must be a non-empty array' },
        { status: 400 }
      );
    }

    // Get the launch
    const launches = await getLaunches();
    const launch = launches.find((l: any) => l.id === params.id);
    if (!launch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    // Get all flavours and filter selected ones
    const flavoursResponse = await getFlavours();
    const allFlavours = Array.isArray(flavoursResponse) ? flavoursResponse : (flavoursResponse.data || []);
    const selectedFlavours = allFlavours.filter((f: any) => flavourIds.includes(f.id));

    if (selectedFlavours.length === 0) {
      return NextResponse.json(
        { error: 'No valid flavours found' },
        { status: 400 }
      );
    }

    // Get all formats
    const formats = await getFormats();
    const activeFormats = formats.filter((f: any) => f.status === 'active');

    // If no active formats, use all formats
    const availableFormats = activeFormats.length > 0 ? activeFormats : formats;

    if (availableFormats.length === 0) {
      return NextResponse.json(
        { error: 'No formats available. Please create formats first.' },
        { status: 400 }
      );
    }

    const products = await getProducts();
    let created = 0;
    let skipped = 0;
    const newProductIds: string[] = [];
    const skippedCombinations: Array<{
      formatName: string;
      flavourName: string;
      reason: string;
    }> = [];

    // Separate single-flavour and multi-flavour formats
    const singleFlavourFormats = availableFormats.filter(
      (f: any) => f.requiresFlavours && f.minFlavours === 1 && f.maxFlavours === 1
    );
    const multiFlavourFormats = availableFormats.filter(
      (f: any) => f.requiresFlavours && f.minFlavours > 1
    );

    // Generate single-flavour products
    for (const format of singleFlavourFormats) {
      for (const flavour of selectedFlavours) {
        // Check eligibility using the new function
        if (!isFormatEligibleForFlavour(format, flavour)) {
          skipped++;
          skippedCombinations.push({
            formatName: format.name,
            flavourName: flavour.name,
            reason: `Flavour type '${flavour.type}' not eligible for this format`
          });
          continue;
        }

        const productData = {
          formatId: format.id,
          primaryFlavourIds: [flavour.id],
          secondaryFlavourIds: [],
          componentIds: [],
          toppingIds: []
        };

        const names = generateProductName(productData, format, [flavour]);
        
        // Check if product already exists
        const existingProduct = products.find(
          (p: any) => 
            p.formatId === format.id && 
            p.primaryFlavourIds?.length === 1 &&
            p.primaryFlavourIds[0] === flavour.id
        );

        if (!existingProduct) {
          const newProduct = {
            id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            internalName: names.internalName,
            publicName: names.publicName,
            slug: `${format.slug}-${flavour.slug || flavour.name.toLowerCase().replace(/\s+/g, '-')}`,
            status: 'draft',
            formatId: format.id,
            primaryFlavourIds: [flavour.id],
            secondaryFlavourIds: [],
            componentIds: [],
            toppingIds: [],
            description: `${flavour.name} ${flavour.type}`,
            price: format.basePrice || 0,
            onlineOrderable: false,
            pickupOnly: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          products.push(newProduct);
          created++;
          newProductIds.push(newProduct.id);
        } else {
          newProductIds.push(existingProduct.id);
        }
      }
    }

    // Generate multi-flavour products (e.g., twist products)
    for (const format of multiFlavourFormats) {
      const requiredFlavours = format.minFlavours || 2;
      
      // Generate all combinations of flavours for this format
      if (requiredFlavours === 2 && selectedFlavours.length >= 2) {
        for (let i = 0; i < selectedFlavours.length; i++) {
          for (let j = i + 1; j < selectedFlavours.length; j++) {
            const flavourPair = [selectedFlavours[i], selectedFlavours[j]];
            
            // Check eligibility using the new function
            if (!isFormatEligibleForFlavours(format, flavourPair)) {
              skipped++;
              skippedCombinations.push({
                formatName: format.name,
                flavourName: `${flavourPair[0].name} + ${flavourPair[1].name}`,
                reason: format.allowMixedTypes === false && flavourPair[0].type !== flavourPair[1].type
                  ? 'Mixed types not allowed for this format'
                  : `One or more flavour types not eligible for this format`
              });
              continue;
            }

            const productData = {
              formatId: format.id,
              primaryFlavourIds: [flavourPair[0].id, flavourPair[1].id],
              secondaryFlavourIds: [],
              componentIds: [],
              toppingIds: []
            };

            const names = generateProductName(productData, format, flavourPair);
            
            const existingProduct = products.find(
              (p: any) => 
                p.formatId === format.id && 
                p.primaryFlavourIds?.length === 2 &&
                p.primaryFlavourIds.includes(flavourPair[0].id) &&
                p.primaryFlavourIds.includes(flavourPair[1].id)
            );

            if (!existingProduct) {
              const newProduct = {
                id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
                internalName: names.internalName,
                publicName: names.publicName,
                slug: `${format.slug}-${flavourPair[0].slug || flavourPair[0].name.toLowerCase().replace(/\s+/g, '-')}-${flavourPair[1].slug || flavourPair[1].name.toLowerCase().replace(/\s+/g, '-')}`,
                status: 'draft',
                formatId: format.id,
                primaryFlavourIds: [flavourPair[0].id, flavourPair[1].id],
                secondaryFlavourIds: [],
                componentIds: [],
                toppingIds: [],
                description: `${flavourPair[0].name} and ${flavourPair[1].name} ${format.name.toLowerCase()}`,
                price: format.basePrice || 0,
                onlineOrderable: false,
                pickupOnly: false,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
              };

              products.push(newProduct);
              created++;
              newProductIds.push(newProduct.id);
            } else {
              newProductIds.push(existingProduct.id);
            }
          }
        }
      }
    }

    // Save updated products
    await saveProducts(products);

    // Update launch with new product IDs
    const updatedProductIds = Array.from(
      new Set([...(launch.featuredProductIds || []), ...newProductIds])
    );

    const updatedLaunches = launches.map((l: { id: string; featuredProductIds?: string[] }) =>
      l.id === params.id
        ? { ...l, featuredProductIds: updatedProductIds }
        : l
    );

    await saveLaunches(updatedLaunches);

    // Build response message
    const formatBreakdown: Record<string, number> = {};
    for (const product of products.filter((p: any) => newProductIds.includes(p.id))) {
      const format = availableFormats.find((f: any) => f.id === product.formatId);
      if (format) {
        formatBreakdown[format.name] = (formatBreakdown[format.name] || 0) + 1;
      }
    }

    const breakdownMessage = Object.entries(formatBreakdown)
      .map(([name, count]) => `${count} ${name.toLowerCase()}`)
      .join(', ');

    return NextResponse.json({
      success: true,
      created,
      skipped,
      total: newProductIds.length,
      breakdown: formatBreakdown,
      message: `Generated ${created} new product(s)${breakdownMessage ? `: ${breakdownMessage}` : ''}${skipped > 0 ? `. Skipped ${skipped} combination(s) due to eligibility rules` : ''}`,
      details: skipped > 0 ? { skippedCombinations } : undefined
    });
  } catch (error) {
    console.error('Error generating products:', error);
    return NextResponse.json(
      { error: 'Failed to generate products' },
      { status: 500 }
    );
  }
}
