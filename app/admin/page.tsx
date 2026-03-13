import Link from 'next/link';

export default function AdminDashboard() {
  const cardGroups = [
    {
      title: 'Launches & Campaigns',
      description: 'Manage product launches and marketing campaigns',
      cards: [
        {
          title: 'Launches',
          description: 'Create and manage product launches with format selection',
          href: '/admin/launches',
          icon: '🚀',
          badge: 'New',
        },
      ],
    },
    {
      title: 'Product Catalog',
      description: 'Build your menu with flavours, formats, and modifiers',
      cards: [
        {
          title: 'Flavours',
          description: 'Flavour archive and recipe management',
          href: '/admin/flavours',
          icon: '🍦',
        },
        {
          title: 'Formats',
          description: 'Product formats and packaging options',
          href: '/admin/formats',
          icon: '📦',
        },
        {
          title: 'Modifiers',
          description: 'Toppings, sauces, and add-ons',
          href: '/admin/modifiers',
          icon: '✨',
          badge: 'New',
        },
        {
          title: 'Products',
          description: 'Generated offerings linked to Shopify',
          href: '/admin/products',
          icon: '🎁',
        },
      ],
    },
    {
      title: 'Ingredients & Sourcing',
      description: 'Ingredient library with provenance and relationships',
      cards: [
        {
          title: 'Ingredients',
          description: 'Ingredient library with taxonomy categories',
          href: '/admin/ingredients',
          icon: '🌿',
        },
      ],
    },
    {
      title: 'Test Kitchen',
      description: 'Track experiments and batch iterations',
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
      description: 'Stories, news, and site content',
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
      title: 'Interactive Experiences',
      description: 'Games and interactive features',
      cards: [
        {
          title: 'Games',
          description: 'Interactive game experiences',
          href: '/admin/games',
          icon: '🎮',
        },
        {
          title: 'Sprites',
          description: 'Game sprites and visual assets',
          href: '/admin/sprites',
          icon: '🎨',
        },
      ],
    },
    {
      title: 'System Configuration',
      description: 'Settings, taxonomies, and integrations',
      cards: [
        {
          title: 'Settings',
          description: 'Taxonomies and global configuration',
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
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">{group.title}</h2>
              <p className="text-sm text-gray-600 mt-1">{group.description}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {group.cards.map((card) => (
                <Link
                  key={card.href}
                  href={card.href}
                  className="group relative bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-lg hover:scale-105 transition-all duration-200 cursor-pointer"
                >
                  {card.badge && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                        {card.badge}
                      </span>
                    </div>
                  )}
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
