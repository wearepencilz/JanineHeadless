import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { searchProducts } from '@/lib/shopify/admin';
import type { ErrorResponse } from '@/types';

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    
    console.log('🔍 Shopify Product Search Request:', { query, limit });
    
    if (!query) {
      const errorResponse: ErrorResponse = {
        error: 'Search query is required',
        code: 'MISSING_QUERY',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }
    
    // Check environment variables (support both OAuth and direct token)
    const shopDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
    const adminToken = process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;
    
    console.log('🔧 Environment Check:', {
      hasShopDomain: !!shopDomain,
      shopDomain: shopDomain,
      hasAdminToken: !!adminToken,
      hasClientId: !!clientId,
      hasClientSecret: !!clientSecret,
      authMethod: adminToken ? 'Direct Token' : (clientId && clientSecret) ? 'OAuth' : 'None'
    });
    
    if (!shopDomain) {
      const errorResponse: ErrorResponse = {
        error: 'Shopify store domain not configured',
        code: 'MISSING_STORE_DOMAIN',
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    if (!adminToken && (!clientId || !clientSecret)) {
      const errorResponse: ErrorResponse = {
        error: 'Shopify credentials not configured',
        code: 'MISSING_CREDENTIALS',
        details: {
          message: 'Provide either SHOPIFY_ADMIN_ACCESS_TOKEN or both SHOPIFY_CLIENT_ID and SHOPIFY_CLIENT_SECRET'
        },
        timestamp: new Date().toISOString()
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }
    
    const products = await searchProducts(query, limit);
    
    console.log('✅ Products Found:', products.length);
    
    return NextResponse.json({ products });
  } catch (error: any) {
    console.error('❌ Error searching Shopify products:', error);
    const errorResponse: ErrorResponse = {
      error: 'Failed to search products',
      details: error.message,
      timestamp: new Date().toISOString()
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
