import { getCollections } from '@/lib/shopify';
import Link from 'next/link';
import Image from 'next/image';

export default async function HomePage() {
  const collections = await getCollections();

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative h-[60vh] bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-5xl md:text-7xl font-bold mb-4 text-gray-900">Janine</h1>
          <p className="text-xl md:text-2xl text-gray-700 mb-8">
            Artisanal ice cream & soft serve
          </p>
          <Link
            href="/collections/all"
            className="inline-block bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
          >
            Shop Now
          </Link>
        </div>
      </section>

      {/* Collections Grid */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold mb-8 text-center">Shop by Category</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((collection) => (
            <Link
              key={collection.id}
              href={`/collections/${collection.handle}`}
              className="group"
            >
              <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
                {collection.image && (
                  <Image
                    src={collection.image.url}
                    alt={collection.image.altText || collection.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                )}
              </div>
              <h3 className="text-xl font-semibold group-hover:text-orange-600 transition-colors">
                {collection.title}
              </h3>
              {collection.description && (
                <p className="text-gray-600 mt-2 line-clamp-2">{collection.description}</p>
              )}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
