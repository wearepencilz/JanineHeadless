import { shopifyFetch } from './client';
import { getShopQuery } from './queries/shop';

export interface Shop {
  name: string;
  description: string;
  primaryDomain: {
    url: string;
  };
}

export async function getShop(): Promise<Shop | null> {
  try {
    const res = await shopifyFetch<{ shop: Shop }>({
      query: getShopQuery,
      cache: 'no-store',
    });

    return res.data.shop;
  } catch (error) {
    console.error('Error fetching shop:', error);
    return null;
  }
}
