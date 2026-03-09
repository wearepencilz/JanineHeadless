'use client';

import Link from 'next/link';

export default function PagesListPage() {
  const pages = [
    { name: 'home', label: 'Home Page', description: 'Hero section and featured content' },
    { name: 'about', label: 'About Page', description: 'Company information and team' },
    { name: 'services', label: 'Services Page', description: 'Services and offerings' },
    { name: 'faq', label: 'FAQ Page', description: 'Frequently asked questions' },
    { name: 'terms', label: 'Terms Page', description: 'Terms and conditions' },
    { name: 'privacy', label: 'Privacy Page', description: 'Privacy policy' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-gray-900">Pages</h1>
        <p className="text-gray-600 mt-2">Edit static page content</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {pages.map((page) => (
          <Link
            key={page.name}
            href={`/admin/pages/${page.name}`}
            className="bg-white rounded-lg border border-gray-200 p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <h2 className="text-lg font-semibold text-gray-900 mb-2">{page.label}</h2>
            <p className="text-sm text-gray-600">{page.description}</p>
            <div className="mt-4 text-sm text-blue-600 font-medium">Edit →</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
