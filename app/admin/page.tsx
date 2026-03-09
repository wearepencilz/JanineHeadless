import Link from 'next/link';

export default function AdminDashboard() {
  const cards = [
    {
      title: 'Ingredients',
      description: 'Manage ingredient library with provenance',
      href: '/admin/ingredients',
      icon: '🌿',
    },
    {
      title: 'Flavours',
      description: 'Flavour archive and Shopify relationships',
      href: '/admin/flavours',
      icon: '🍦',
    },
    {
      title: 'Batches',
      description: 'Test kitchen batch tracking',
      href: '/admin/batches',
      icon: '🧪',
    },
    {
      title: 'Stories',
      description: 'Editorial content and collaborations',
      href: '/admin/stories',
      icon: '📖',
    },
    {
      title: 'Settings',
      description: 'Configure site settings',
      href: '/admin/settings',
      icon: '⚙️',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your content management system</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <div className="text-4xl mb-4">{card.icon}</div>
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{card.title}</h2>
            <p className="text-sm text-gray-600">{card.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
