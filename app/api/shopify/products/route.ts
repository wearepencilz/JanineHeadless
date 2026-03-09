import { NextResponse } from 'next/server';
import { getProducts } from '@/lib/shopify';

export async function GET() {
  try {
    const products = await getProducts();
    
    // Return simplified product list for CMS linking
    const simplified = products.map((product) => ({
      id: product.id,
      handle: product.handle,
      title: product.title,
    }));
    
    return NextResponse.json(simplified);
  } catch (error) {
    console.error('Error fetching Shopify products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}
