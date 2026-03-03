import { getShop } from '@/lib/shopify';

export default async function HomePage() {
  const shop = await getShop();

  return (
    <main className="min-h-screen p-8">
      <h1 className="text-4xl font-bold">Welcome to Janine Headless Store</h1>
      <p className="mt-4 text-lg">
        Next.js + Shopify headless storefront is being set up...
      </p>
      
      {shop ? (
        <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-green-800">✓ Shopify Connected!</h2>
          <p className="mt-2 text-green-700">Store: {shop.name}</p>
          <p className="text-green-700">URL: {shop.primaryDomain.url}</p>
        </div>
      ) : (
        <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-2xl font-semibold text-yellow-800">⚠ Shopify Not Connected</h2>
          <p className="mt-2 text-yellow-700">
            Please configure your Shopify credentials in .env.local
          </p>
          <pre className="mt-4 p-4 bg-yellow-100 rounded text-sm">
{`NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN=your-store.myshopify.com
NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-token`}
          </pre>
        </div>
      )}
    </main>
  );
}
