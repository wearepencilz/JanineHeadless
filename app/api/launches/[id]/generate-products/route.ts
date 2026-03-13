import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import db from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
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
    const launch = await db.getLaunch(params.id);
    if (!launch) {
      return NextResponse.json({ error: 'Launch not found' }, { status: 404 });
    }

    // Get all flavours
    const allFlavours = await db.getFlavours();
    const selectedFlavours = allFlavours.filter(f => flavourIds.includes(f.id));

    if (selectedFlavours.length === 0) {
      return NextResponse.json(
        { error: 'No valid flavours found' },
        { status: 400 }
      );
    }

    // Get all formats to generate products for each flavour
    const formats = await db.getFormats();
    const activeFormats = formats.filter(f => f.status === 'active');

    if (activeFormats.length === 0) {
      return NextResponse.json(
        { error: 'No active formats available. Please create formats first.' },
        { status: 400 }
      );
    }

    // Generate products for each flavour x format combination
    const products = await db.getProducts();
    let created = 0;
    const newProductIds: string[] = [];

    for (const flavour of selectedFlavours) {
      for (const format of activeFormats) {
        // Check if product already exists
        const existingProduct = products.find(
          p => p.flavourId === flavour.id && p.formatId === format.id
        );

        if (!existingProduct) {
          // Create new product
          const productName = `${flavour.name} - ${format.name}`;
          const newProduct = await db.createProduct({
            name: productName,
            flavourId: flavour.id,
            formatId: format.id,
            status: 'draft',
            description: `${flavour.name} in ${format.name} format`,
            price: format.basePrice || 0,
          });

          created++;
          newProductIds.push(newProduct.id);
        } else {
          // Add existing product to the list
          newProductIds.push(existingProduct.id);
        }
      }
    }

    // Update launch with new product IDs
    const updatedProductIds = Array.from(
      new Set([...launch.featuredProductIds, ...newProductIds])
    );

    await db.updateLaunch(params.id, {
      ...launch,
      featuredProductIds: updatedProductIds,
    });

    return NextResponse.json({
      success: true,
      created,
      total: newProductIds.length,
      message: `Generated ${created} new product(s) and added ${newProductIds.length} total product(s) to launch`,
    });
  } catch (error) {
    console.error('Error generating products:', error);
    return NextResponse.json(
      { error: 'Failed to generate products' },
      { status: 500 }
    );
  }
}
