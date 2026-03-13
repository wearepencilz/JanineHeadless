import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getFlavours, getFormats, getProducts, saveProducts, getLaunches, saveLaunches } from '@/lib/db';
import { generateProductName } from '@/lib/validation';

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

    // Separate flavours by type
    const gelatoFlavours = selectedFlavours.filter((f: any) => f.type === 'gelato');
    const sorbetFlavours = selectedFlavours.filter((f: any) => f.type === 'sorbet');

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

    // Find specific format serving styles
    // Try to find scoop format, or use the first available format
    const scoopFormat = availableFormats.find((f: any) => 
      f.servingStyle?.toLowerCase() === 'scoop' || f.category?.toLowerCase() === 'scoop'
    ) || availableFormats[0];
    const twistFormat = availableFormats.find((f: any) => 
      f.servingStyle?.toLowerCase() === 'twist' || f.category?.toLowerCase() === 'twist'
    );

    if (!scoopFormat) {
      return NextResponse.json(
        { error: 'No formats available for single-flavour products. Please create at least one format.' },
        { status: 400 }
      );
    }

    const products = await getProducts();
    let created = 0;
    const newProductIds: string[] = [];

    // Generate single-flavour gelato products (scoop format)
    for (const flavour of gelatoFlavours) {
      const productData = {
        formatId: scoopFormat.id,
        primaryFlavourIds: [flavour.id],
        secondaryFlavourIds: [],
        componentIds: [],
        toppingIds: []
      };

      const names = generateProductName(productData, scoopFormat, [flavour]);
      
      // Check if product already exists
      const existingProduct = products.find(
        (p: any) => 
          p.formatId === scoopFormat.id && 
          p.primaryFlavourIds?.length === 1 &&
          p.primaryFlavourIds[0] === flavour.id
      );

      if (!existingProduct) {
        const newProduct = {
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          internalName: names.internalName,
          publicName: names.publicName,
          slug: `${scoopFormat.slug}-${flavour.slug || flavour.name.toLowerCase().replace(/\s+/g, '-')}`,
          status: 'draft',
          formatId: scoopFormat.id,
          primaryFlavourIds: [flavour.id],
          secondaryFlavourIds: [],
          componentIds: [],
          toppingIds: [],
          description: `${flavour.name} gelato`,
          price: scoopFormat.basePrice || 0,
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

    // Generate single-flavour sorbet products (scoop format)
    for (const flavour of sorbetFlavours) {
      const productData = {
        formatId: scoopFormat.id,
        primaryFlavourIds: [flavour.id],
        secondaryFlavourIds: [],
        componentIds: [],
        toppingIds: []
      };

      const names = generateProductName(productData, scoopFormat, [flavour]);
      
      const existingProduct = products.find(
        (p: any) => 
          p.formatId === scoopFormat.id && 
          p.primaryFlavourIds?.length === 1 &&
          p.primaryFlavourIds[0] === flavour.id
      );

      if (!existingProduct) {
        const newProduct = {
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          internalName: names.internalName,
          publicName: names.publicName,
          slug: `${scoopFormat.slug}-${flavour.slug || flavour.name.toLowerCase().replace(/\s+/g, '-')}`,
          status: 'draft',
          formatId: scoopFormat.id,
          primaryFlavourIds: [flavour.id],
          secondaryFlavourIds: [],
          componentIds: [],
          toppingIds: [],
          description: `${flavour.name} sorbet`,
          price: scoopFormat.basePrice || 0,
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

    // Generate twist products (if we have both gelato and sorbet, and twist format exists)
    if (twistFormat && gelatoFlavours.length > 0 && sorbetFlavours.length > 0) {
      for (const gelatoFlavour of gelatoFlavours) {
        for (const sorbetFlavour of sorbetFlavours) {
          const productData = {
            formatId: twistFormat.id,
            primaryFlavourIds: [gelatoFlavour.id, sorbetFlavour.id],
            secondaryFlavourIds: [],
            componentIds: [],
            toppingIds: []
          };

          const names = generateProductName(productData, twistFormat, [gelatoFlavour, sorbetFlavour]);
          
          const existingProduct = products.find(
            (p: any) => 
              p.formatId === twistFormat.id && 
              p.primaryFlavourIds?.length === 2 &&
              p.primaryFlavourIds.includes(gelatoFlavour.id) &&
              p.primaryFlavourIds.includes(sorbetFlavour.id)
          );

          if (!existingProduct) {
            const newProduct = {
              id: `product-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`,
              internalName: names.internalName,
              publicName: names.publicName,
              slug: `${twistFormat.slug}-${gelatoFlavour.slug || gelatoFlavour.name.toLowerCase().replace(/\s+/g, '-')}-${sorbetFlavour.slug || sorbetFlavour.name.toLowerCase().replace(/\s+/g, '-')}`,
              status: 'draft',
              formatId: twistFormat.id,
              primaryFlavourIds: [gelatoFlavour.id, sorbetFlavour.id],
              secondaryFlavourIds: [],
              componentIds: [],
              toppingIds: [],
              description: `${gelatoFlavour.name} and ${sorbetFlavour.name} twist`,
              price: twistFormat.basePrice || 0,
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

    const twistCount = twistFormat && gelatoFlavours.length > 0 && sorbetFlavours.length > 0 
      ? gelatoFlavours.length * sorbetFlavours.length 
      : 0;

    return NextResponse.json({
      success: true,
      created,
      total: newProductIds.length,
      breakdown: {
        gelato: gelatoFlavours.length,
        sorbet: sorbetFlavours.length,
        twist: twistCount
      },
      message: `Generated ${created} new product(s): ${gelatoFlavours.length} gelato, ${sorbetFlavours.length} sorbet${twistCount > 0 ? `, ${twistCount} twist` : ''}`,
    });
  } catch (error) {
    console.error('Error generating products:', error);
    return NextResponse.json(
      { error: 'Failed to generate products' },
      { status: 500 }
    );
  }
}
