'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DataTable, { Column, Action } from '@/app/admin/components/DataTable';
import TableFilters, { FilterConfig } from '@/app/admin/components/TableFilters';
import DeleteModal from '@/app/admin/components/DeleteModal';

interface Product {
  id: string;
  internalName: string;
  publicName: string;
  slug: string;
  status: string;
  formatId: string;
  primaryFlavourIds: string[];
  secondaryFlavourIds?: string[];
  componentIds?: string[];
  toppingIds?: string[];
  description?: string;
  shortCardCopy?: string;
  image?: string;
  price: number;
  tags?: string[];
  onlineOrderable: boolean;
  shopifyProductId?: string;
  shopifyProductHandle?: string;
  syncStatus?: string;
}

interface Format {
  id: string;
  name: string;
}

interface Launch {
  id: string;
  title: string;
  slug: string;
  status: string;
  featuredProductIds: string[];
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [formats, setFormats] = useState<Format[]>([]);
  const [launches, setLaunches] = useState<Launch[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; id: string; name: string }>({
    show: false,
    id: '',
    name: '',
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter, formatFilter]);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Build query params
      const params = new URLSearchParams();
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      if (formatFilter !== 'all') {
        params.append('formatId', formatFilter);
      }

      const [productsRes, formatsRes, launchesRes] = await Promise.all([
        fetch(`/api/products?${params.toString()}`),
        fetch('/api/formats'),
        fetch('/api/launches'),
      ]);

      if (productsRes.ok && formatsRes.ok && launchesRes.ok) {
        const productsData = await productsRes.json();
        const formatsData = await formatsRes.json();
        const launchesData = await launchesRes.json();
        setProducts(productsData);
        setFormats(formatsData.data || formatsData);
        setLaunches(launchesData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  // Filter by search query
  const filteredProducts = products.filter(product =>
    product.publicName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.internalName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatName = (formatId: string) => {
    const format = formats.find(f => f.id === formatId);
    return format?.name || 'Unknown';
  };

  const getProductLaunches = (productId: string) => {
    return launches.filter(launch => 
      launch.featuredProductIds?.includes(productId)
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'sold-out':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDeleteClick = (product: Product) => {
    setDeleteConfirm({ show: true, id: product.id, name: product.publicName });
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/products/${deleteConfirm.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProducts(products.filter((p) => p.id !== deleteConfirm.id));
        setDeleteConfirm({ show: false, id: '', name: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const filters: FilterConfig[] = [
    {
      type: 'search',
      label: 'Search',
      placeholder: 'Search by name...',
      value: searchQuery,
      onChange: setSearchQuery,
    },
    {
      type: 'select',
      label: 'Status',
      value: statusFilter,
      onChange: setStatusFilter,
      options: [
        { value: 'all', label: 'All Statuses' },
        { value: 'active', label: 'Active' },
        { value: 'draft', label: 'Draft' },
        { value: 'scheduled', label: 'Scheduled' },
        { value: 'sold-out', label: 'Sold Out' },
        { value: 'archived', label: 'Archived' },
      ],
    },
    {
      type: 'select',
      label: 'Format',
      value: formatFilter,
      onChange: setFormatFilter,
      options: [
        { value: 'all', label: 'All Formats' },
        ...formats.map((format) => ({
          value: format.id,
          label: format.name,
        })),
      ],
    },
  ];

  const columns: Column<Product>[] = [
    {
      key: 'publicName',
      label: 'Product',
      render: (product) => (
        <div>
          <div className="text-sm font-medium text-gray-900">{product.publicName}</div>
          {product.shortCardCopy && (
            <div className="text-sm text-gray-500 truncate max-w-xs">
              {product.shortCardCopy}
            </div>
          )}
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'formatId',
      label: 'Format',
      render: (product) => (
        <div className="text-sm text-gray-900">{getFormatName(product.formatId)}</div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'flavours',
      label: 'Flavours',
      render: (product) => (
        <div>
          <div className="text-sm text-gray-900">{product.primaryFlavourIds.length}</div>
          {product.toppingIds && product.toppingIds.length > 0 && (
            <div className="text-xs text-gray-500">+{product.toppingIds.length} modifiers</div>
          )}
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'price',
      label: 'Price',
      render: (product) => (
        <div className="text-sm text-gray-900">
          {product.price > 0 ? `${(product.price / 100).toFixed(2)}` : '—'}
        </div>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'status',
      label: 'Status',
      render: (product) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(product.status)}`}>
          {product.status}
        </span>
      ),
      className: 'whitespace-nowrap',
    },
    {
      key: 'launch',
      label: 'Launch',
      render: (product) => {
        const productLaunches = getProductLaunches(product.id);
        if (productLaunches.length === 0) {
          return <span className="text-sm text-gray-400">—</span>;
        }
        return (
          <div className="flex flex-col gap-1">
            {productLaunches.map((launch) => (
              <a
                key={launch.id}
                href={`/admin/launches/${launch.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/admin/launches/${launch.id}`);
                }}
                className="text-xs text-blue-600 hover:text-blue-800 underline cursor-pointer"
              >
                {launch.title}
              </a>
            ))}
          </div>
        );
      },
      className: 'whitespace-nowrap',
    },
    {
      key: 'shopify',
      label: 'Shopify',
      render: (product) => {
        if (product.shopifyProductId) {
          return (
            <div className="flex flex-col gap-1">
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 inline-flex items-center gap-1 w-fit">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Linked
              </span>
              {product.shopifyProductHandle && (
                <a
                  href={`https://admin.shopify.com/store/${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace('.myshopify.com', '')}/products/${product.shopifyProductHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  onClick={(e) => e.stopPropagation()}
                >
                  View →
                </a>
              )}
            </div>
          );
        }
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600">
            Not linked
          </span>
        );
      },
      className: 'whitespace-nowrap',
    },
  ];

  const actions: Action<Product>[] = [
    {
      label: 'Edit',
      href: (product) => `/admin/products/${product.id}`,
      stopPropagation: true,
    },
    {
      label: 'Delete',
      onClick: handleDeleteClick,
      className: 'text-red-600 hover:text-red-900',
      stopPropagation: true,
    },
  ];

  return (
    <>
      <DataTable
        title="Products"
        description="Manage sellable products by combining formats with flavours and modifiers"
        createButton={{ label: 'Create Product', href: '/admin/products/create' }}
        filters={<TableFilters filters={filters} />}
        data={filteredProducts}
        columns={columns}
        actions={actions}
        keyExtractor={(product) => product.id}
        onRowClick={(product) => router.push(`/admin/products/${product.id}`)}
        emptyMessage="No products found. Create your first product to get started."
        loading={loading}
      />

      <DeleteModal
        isOpen={deleteConfirm.show}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteConfirm.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm({ show: false, id: '', name: '' })}
      />
    </>
  );
}
