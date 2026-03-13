'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Offering, Format, Flavour, Ingredient } from '@/types';
import ShopifyProductPicker from '../../components/ShopifyProductPicker';
import { computeProductAllergens, formatAllergen, formatDietaryClaim, getAllergenBadgeColor, getDietaryClaimBadgeColor } from '@/lib/product-allergens';
import EditPageLayout from '@/app/admin/components/EditPageLayout';
import { Button } from '@/app/admin/components/ui/button';
import { Input } from '@/app/admin/components/ui/input';
import { Textarea } from '@/app/admin/components/ui/textarea';

export default function EditProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [offering, setOffering] = useState<Offering | null>(null);
  const [format, setFormat] = useState<Format | null>(null);
  const [flavours, setFlavours] = useState<Flavour[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [creatingShopifyProduct, setCreatingShopifyProduct] = useState(false);

  const [formData, setFormData] = useState({
    internalName: '',
    publicName: '',
    description: '',
    shortCardCopy: '',
    price: '',
    compareAtPrice: '',
    status: 'draft',
    tags: '',
    inventoryTracked: false,
    inventoryQuantity: '',
    onlineOrderable: true,
    pickupOnly: false,
    shopifyProductId: '',
    shopifyProductHandle: '',
  });

  useEffect(() => {
    fetchData();
  }, [params.id]);

  async function fetchData() {
    try {
      const [offeringRes, flavoursRes, ingredientsRes] = await Promise.all([
        fetch(`/api/products/${params.id}`),
        fetch('/api/flavours'),
        fetch('/api/ingredients'),
      ]);

      if (offeringRes.ok && flavoursRes.ok && ingredientsRes.ok) {
        const offeringData = await offeringRes.json();
        const flavoursData = await flavoursRes.json();
        const ingredientsData = await ingredientsRes.json();
        
        setOffering(offeringData);
        setFlavours(flavoursData.data || flavoursData);
        setIngredients(ingredientsData.data || ingredientsData);

        // Fetch format
        const formatRes = await fetch(`/api/formats/${offeringData.formatId}`);
        if (formatRes.ok) {
          setFormat(await formatRes.json());
        } else {
          console.error('Failed to fetch format:', offeringData.formatId, formatRes.status);
        }

        // Populate form
        setFormData({
          internalName: offeringData.internalName || '',
          publicName: offeringData.publicName || '',
          description: offeringData.description || '',
          shortCardCopy: offeringData.shortCardCopy || '',
          price: offeringData.price ? (offeringData.price / 100).toFixed(2) : '',
          compareAtPrice: offeringData.compareAtPrice ? (offeringData.compareAtPrice / 100).toFixed(2) : '',
          status: offeringData.status || 'draft',
          tags: (offeringData.tags || []).join(', '),
          inventoryTracked: offeringData.inventoryTracked || false,
          inventoryQuantity: offeringData.inventoryQuantity?.toString() || '',
          onlineOrderable: offeringData.onlineOrderable !== undefined ? offeringData.onlineOrderable : true,
          pickupOnly: offeringData.pickupOnly || false,
          shopifyProductId: offeringData.shopifyProductId || '',
          shopifyProductHandle: offeringData.shopifyProductHandle || '',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setErrors([]);

    try {
      const price = formData.price ? Math.round(parseFloat(formData.price) * 100) : 0;
      const compareAtPrice = formData.compareAtPrice ? Math.round(parseFloat(formData.compareAtPrice) * 100) : undefined;

      const payload = {
        internalName: formData.internalName,
        publicName: formData.publicName,
        description: formData.description,
        shortCardCopy: formData.shortCardCopy,
        price,
        compareAtPrice,
        status: formData.status,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        inventoryTracked: formData.inventoryTracked,
        inventoryQuantity: formData.inventoryQuantity ? parseInt(formData.inventoryQuantity) : undefined,
        onlineOrderable: formData.onlineOrderable,
        pickupOnly: formData.pickupOnly,
        shopifyProductId: formData.shopifyProductId || undefined,
        shopifyProductHandle: formData.shopifyProductHandle || undefined,
      };

      const response = await fetch(`/api/products/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        // Stay on the same page and show success message
        const updatedProduct = await response.json();
        setOffering(updatedProduct);
        alert('Product updated successfully');
      } else {
        const error = await response.json();
        setErrors([error.error || 'Failed to update product']);
      }
    } catch (error) {
      console.error('Error updating product:', error);
      setErrors(['Failed to update product']);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    try {
      const response = await fetch(`/api/products/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/admin/products');
      } else {
        const error = await response.json();
        setErrors([error.error || 'Failed to delete product']);
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      setErrors(['Failed to delete product']);
    }
  }

  async function handleCreateShopifyProduct() {
    // Validate before attempting to create
    const validationErrors: string[] = [];
    
    const currentPrice = formData.price ? parseFloat(formData.price) : 0;
    if (!currentPrice || currentPrice <= 0) {
      validationErrors.push('Price must be greater than $0 to create a Shopify product');
    }
    
    if (!offering?.formatId) {
      validationErrors.push('Offering must have a format');
    }
    
    if (!offering?.primaryFlavourIds || offering.primaryFlavourIds.length === 0) {
      validationErrors.push('Offering must have at least one flavour');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      return;
    }

    if (!confirm('Create a new Shopify product for this offering?')) {
      return;
    }

    setCreatingShopifyProduct(true);
    setErrors([]);

    try {
      const response = await fetch(`/api/products/${params.id}/create-shopify-product`, {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        // Show detailed error message from API
        const errorMessage = data.details 
          ? `${data.error}: ${typeof data.details === 'string' ? data.details : JSON.stringify(data.details)}`
          : data.error || 'Failed to create Shopify product';
        throw new Error(errorMessage);
      }

      // Update form data with new Shopify product info
      setFormData(prev => ({
        ...prev,
        shopifyProductId: data.shopifyProduct.id,
        shopifyProductHandle: data.shopifyProduct.handle,
      }));

      // Update offering state immediately
      if (offering) {
        setOffering({
          ...offering,
          shopifyProductId: data.shopifyProduct.id,
          shopifyProductHandle: data.shopifyProduct.handle,
          syncStatus: 'synced',
          lastSyncedAt: data.offering.lastSyncedAt,
        });
      }

      // Refresh offering data from server to ensure consistency
      await fetchData();

      alert(`✅ Shopify product created successfully!\n\nTitle: ${data.shopifyProduct.title}\nHandle: ${data.shopifyProduct.handle}\n\nThe offering is now linked to this product.`);
    } catch (error) {
      console.error('Error creating Shopify product:', error);
      setErrors([error instanceof Error ? error.message : 'Failed to create Shopify product']);
    } finally {
      setCreatingShopifyProduct(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!offering) {
    return (
      <EditPageLayout
        title="Edit Product"
        backHref="/admin/products"
        backLabel="Back to Products"
        onSave={() => {}}
        onCancel={() => router.push('/admin/products')}
        error="Product not found"
        maxWidth="7xl"
      >
        <div />
      </EditPageLayout>
    );
  }

  const primaryFlavours = flavours.filter(f => offering.primaryFlavourIds.includes(f.id));

  // Compute allergens and dietary claims from flavours and their ingredients
  const flavourIngredientIds = primaryFlavours.flatMap(f => 
    f.ingredients?.map(fi => fi.ingredientId) || []
  );
  const flavourIngredients = ingredients.filter(ing => 
    flavourIngredientIds.includes(ing.id)
  );
  
  const allergenData = computeProductAllergens(primaryFlavours, flavourIngredients, []);

  return (
    <EditPageLayout
      title="Edit Product"
      backHref="/admin/products"
      backLabel="Back to Products"
      onSave={() => handleSubmit(new Event('submit') as any)}
      onDelete={handleDelete}
      onCancel={() => router.push('/admin/products')}
      saving={saving}
      error={errors.length > 0 ? errors.join(', ') : undefined}
      maxWidth="7xl"
    >

      {/* Shopify Integration Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Shopify Integration</h2>
          {formData.shopifyProductId ? (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800 flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              Linked to Shopify
            </span>
          ) : (
            <span className="px-3 py-1 text-sm font-medium rounded-full bg-gray-100 text-gray-600">
              Not linked
            </span>
          )}
        </div>
        
        {formData.shopifyProductId ? (
          // Linked State
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 mb-2">
                    Connected to Shopify Product
                  </p>
                  <div className="space-y-1 text-sm text-green-700">
                    <p>
                      <span className="font-medium">Handle:</span>{' '}
                      <span className="font-mono text-xs">{formData.shopifyProductHandle}</span>
                    </p>
                    <p className="text-xs text-green-600">
                      Product ID: {formData.shopifyProductId}
                    </p>
                  </div>
                  {formData.shopifyProductHandle && (
                    <a
                      href={`https://admin.shopify.com/store/${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN?.replace('.myshopify.com', '')}/products/${formData.shopifyProductHandle}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-3 text-sm text-green-700 hover:text-green-900 font-medium"
                    >
                      View in Shopify Admin
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => {
                    if (confirm('Are you sure you want to unlink this Shopify product? This will not delete the product from Shopify.')) {
                      setFormData({
                        ...formData,
                        shopifyProductId: '',
                        shopifyProductHandle: '',
                      });
                    }
                  }}
                  className="ml-4"
                >
                  Unlink
                </Button>
              </div>
            </div>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                💡 Changes to this product will be synced to Shopify when you save. To manage inventory, variants, or other Shopify-specific settings, use the Shopify Admin.
              </p>
            </div>
          </div>
        ) : (
          // Not Linked State
          <div className="space-y-4">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 mb-3">
                This product is not connected to Shopify. Choose one of the options below to enable online sales:
              </p>
              
              {/* Create New Option */}
              <div className="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Create New Shopify Product</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Automatically create a new product in Shopify with this product's details
                    </p>
                    {(!formData.price || parseFloat(formData.price) <= 0) && (
                      <div className="mb-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ Set a price greater than $0 before creating a Shopify product
                        </p>
                      </div>
                    )}
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleCreateShopifyProduct}
                      isDisabled={creatingShopifyProduct || !formData.price || parseFloat(formData.price) <= 0}
                      isLoading={creatingShopifyProduct}
                    >
                      {creatingShopifyProduct ? 'Creating...' : 'Create New Product'}
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Link Existing Option */}
              <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 mb-1">Link to Existing Product</h4>
                    <p className="text-sm text-gray-600 mb-3">
                      Connect this product to an existing Shopify product
                    </p>
                    <ShopifyProductPicker
                      selectedProductId={formData.shopifyProductId}
                      selectedProductHandle={formData.shopifyProductHandle}
                      onSelect={(product) => {
                        if (product) {
                          setFormData({
                            ...formData,
                            shopifyProductId: product.id,
                            shopifyProductHandle: product.handle,
                          });
                        } else {
                          setFormData({
                            ...formData,
                            shopifyProductId: '',
                            shopifyProductHandle: '',
                          });
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Product Composition Section */}
      {format && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Composition</h2>
          
          {/* Format */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Format</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-sm text-gray-900 font-medium">{format.name}</p>
              <p className="text-xs text-gray-600 mt-1">{format.description}</p>
            </div>
          </div>

          {/* Flavours */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Flavours</h3>
            <div className="space-y-2">
              {primaryFlavours.map((flavour) => (
                <div key={flavour.id} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="text-sm text-gray-900 font-medium">{flavour.name}</p>
                      <p className="text-xs text-gray-600 mt-1">{flavour.shortDescription}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-700 rounded">
                          {flavour.type}
                        </span>
                        <span className="px-2 py-0.5 text-xs bg-purple-100 text-purple-700 rounded">
                          {flavour.baseStyle}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Allergens & Dietary Claims - Computed */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Allergens & Dietary Information</h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-3">
                ℹ️ Computed from flavour ingredients
              </p>
              
              {/* Allergens */}
              {allergenData.allergens.length > 0 ? (
                <div className="mb-3">
                  <p className="text-xs font-medium text-gray-700 mb-2">Contains Allergens:</p>
                  <div className="flex flex-wrap gap-1">
                    {allergenData.allergens.map(allergen => (
                      <span
                        key={allergen}
                        className={`px-2 py-1 text-xs font-medium rounded ${getAllergenBadgeColor(allergen)}`}
                      >
                        {formatAllergen(allergen)}
                      </span>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mb-3">
                  <p className="text-xs text-gray-600">No allergens detected</p>
                </div>
              )}
              
              {/* Dietary Claims */}
              {allergenData.dietaryClaims.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-gray-700 mb-2">Dietary Claims:</p>
                  <div className="flex flex-wrap gap-1">
                    {allergenData.dietaryClaims
                      .filter(claim => !claim.startsWith('contains-')) // Show only positive claims
                      .map(claim => (
                        <span
                          key={claim}
                          className={`px-2 py-1 text-xs font-medium rounded ${getDietaryClaimBadgeColor(claim)}`}
                        >
                          {formatDietaryClaim(claim)}
                        </span>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-800">
              💡 Format and flavours cannot be changed after creation. Create a new product to use different format/flavours.
            </p>
          </div>
        </div>
      )}

      {/* Edit Product Details Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Product Details</h2>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Internal Name"
                  type="text"
                  value={formData.internalName}
                  onChange={(value) => setFormData({ ...formData, internalName: value })}
                  isRequired
                />
              </div>

              <div>
                <Input
                  label="Public Name"
                  type="text"
                  value={formData.publicName}
                  onChange={(value) => setFormData({ ...formData, publicName: value })}
                  isRequired
                />
              </div>
            </div>

            <div>
              <Textarea
                label="Description"
                value={formData.description}
                onChange={(value) => setFormData({ ...formData, description: value })}
                rows={4}
                isRequired
              />
            </div>

            <div>
              <Input
                label="Short Card Copy"
                type="text"
                value={formData.shortCardCopy}
                onChange={(value) => setFormData({ ...formData, shortCardCopy: value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Input
                  label="Price ($)"
                  type="number"
                  value={formData.price}
                  onChange={(value) => setFormData({ ...formData, price: value })}
                />
              </div>

              <div>
                <Input
                  label="Compare At Price ($)"
                  type="number"
                  value={formData.compareAtPrice}
                  onChange={(value) => setFormData({ ...formData, compareAtPrice: value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="draft">Draft</option>
                <option value="scheduled">Scheduled</option>
                <option value="active">Active</option>
                <option value="sold-out">Sold Out</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            <div>
              <Input
                label="Tags (comma-separated)"
                type="text"
                value={formData.tags}
                onChange={(value) => setFormData({ ...formData, tags: value })}
              />
            </div>

            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.inventoryTracked}
                  onChange={(e) => setFormData({ ...formData, inventoryTracked: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Track Inventory</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.onlineOrderable}
                  onChange={(e) => setFormData({ ...formData, onlineOrderable: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Online Orderable</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.pickupOnly}
                  onChange={(e) => setFormData({ ...formData, pickupOnly: e.target.checked })}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Pickup Only</span>
              </label>
            </div>

            {formData.inventoryTracked && (
              <div>
                <Input
                  label="Inventory Quantity"
                  type="number"
                  value={formData.inventoryQuantity}
                  onChange={(value) => setFormData({ ...formData, inventoryQuantity: value })}
                />
              </div>
            )}
          </div>
        </form>
      </div>
    </EditPageLayout>
  );
}
