import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { getProducts, saveProducts, getFormats, getFlavours } from '@/lib/db';
import { createProduct, type CreateProductInput } from '@/lib/shopify/admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get the product
    const products = await getProducts();
    const product = products.find((p: any) => p.id === params.id);
    
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if already linked
    if (product.shopifyProductId) {
      return NextResponse.json(
        { error: 'Product is already linked to a Shopify product' },
        { status: 400 }
      );
    }

    // Get format and flavours for product details
    const formats = await getFormats();
    const flavours = await getFlavours();
    
    const format = formats.find((f: any) => f.id === product.formatId);
    const primaryFlavours = flavours.filter((f: any) => 
      product.primaryFlavourIds?.includes(f.id)
    );

    // Build product title and description
    const title = product.publicName || product.internalName;
    const flavourNames = primaryFlavours.map((f: any) => f.name).join(' & ');
    const formatName = format?.name || 'Product';
    
    const descriptionHtml = `
      <p>${product.description || ''}</p>
      ${format ? `<p><strong>Format:</strong> ${format.name}</p>` : ''}
      ${flavourNames ? `<p><strong>Flavours:</strong> ${flavourNames}</p>` : ''}
    `.trim();

    // Prepare Shopify product input
    const shopifyInput: CreateProductInput = {
      title,
      descriptionHtml,
      productType: formatName,
      vendor: 'Janine',
      tags: product.tags || [],
      status: product.status === 'active' ? 'ACTIVE' : 'DRAFT',
      variants: product.price ? [{
        price: (product.price / 100).toFixed(2),
        sku: product.slug || product.id,
      }] : undefined,
    };

    // Create product in Shopify
    console.log('Creating Shopify product:', shopifyInput);
    const shopifyProduct = await createProduct(shopifyInput);
    
    // Update local product with Shopify IDs
    const productIndex = products.findIndex((p: any) => p.id === params.id);
    products[productIndex] = {
      ...products[productIndex],
      shopifyProductId: shopifyProduct.id,
      shopifyProductHandle: shopifyProduct.handle,
      syncStatus: 'synced',
      lastSyncedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await saveProducts(products);

    return NextResponse.json({
      success: true,
      shopifyProduct: {
        id: shopifyProduct.id,
        handle: shopifyProduct.handle,
        title: shopifyProduct.title,
      },
      offering: products[productIndex],
    });

  } catch (error: any) {
    console.error('Error creating Shopify product:', error);
    return NextResponse.json(
      { 
        error: 'Failed to create Shopify product',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
