import Link from 'next/link';

export default function AdminDashboard() {
  const cardGroups = [
    {
      title: 'Product Management',
      cards: [
        {
          title: 'Formats',
          description: 'Product formats and packaging options',
          href: '/admin/formats',
          icon: '📦',
        },
        {
          title: 'Ingredients',
          description: 'Ingredient library with provenance',
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
          title: 'Offerings',
          description: 'Product offerings and bundles',
          href: '/admin/offerings',
          icon: '🎁',
        },
      ],
    },
    {
      title: 'Test Kitchen',
      cards: [
        {
          title: 'Batches',
          description: 'Test kitchen batch tracking and iterations',
          href: '/admin/batches',
          icon: '🧪',
        },
      ],
    },
    {
      title: 'Content & Editorial',
      cards: [
        {
          title: 'News',
          description: 'Editorial content, stories, and updates',
          href: '/admin/news',
          icon: '📰',
        },
        {
          title: 'Pages',
          description: 'Manage site pages and content',
          href: '/admin/pages',
          icon: '📄',
        },
      ],
    },
    {
      title: 'Interactive',
      cards: [
        {
          title: 'Games',
          description: 'Interactive game experiences',
          href: '/admin/games',
          icon: '🎮',
        },
      ],
    },
    {
      title: 'Configuration',
      cards: [
        {
          title: 'Settings',
          description: 'Configure site settings',
          href: '/admin/settings',
          icon: '⚙️',
        },
      ],
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">Welcome to your content management system</p>
      </div>

      <div className="space-y-8">
        {cardGroups.map((group) => (
          <div key={group.title}>
            <h2 className="text-lg font-semibold text-gray-700 mb-4">{group.title}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-200">
                    {card.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                    {card.title}
                  </h3>
                  <p className="text-sm text-gray-600 group-hover:text-gray-700 transition-colors">
                    {card.description}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
