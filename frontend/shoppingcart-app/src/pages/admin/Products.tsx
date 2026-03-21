import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye, X, ArrowLeft, Package, Layers } from 'lucide-react'
import { productService, CreateProductRequest, categoryService, Category, variantService, ProductVariant, CreateVariantRequest } from '../../services/productService'
import toast from 'react-hot-toast'

export default function AdminProducts() {
  const [searchTerm, setSearchTerm] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [showAddView, setShowAddView] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<any>(null)
  const [showVariantModal, setShowVariantModal] = useState(false)
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(null)

  const queryClient = useQueryClient()

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', pageIndex, searchTerm],
    queryFn: () => productService.getProducts({ 
      pageIndex, 
      pageSize: 10,
      search: searchTerm || undefined 
    }),
  })

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getCategories(),
  })

  const createMutation = useMutation({
    mutationFn: (product: CreateProductRequest) => productService.createProduct(product),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      setShowAddView(false)
    },
  })

  const createVariantMutation = useMutation({
    mutationFn: (variant: CreateVariantRequest) => variantService.createVariant(variant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['product-variants'] })
      setShowVariantModal(false)
      setEditingVariant(null)
      toast.success('Variant created successfully')
    },
    onError: () => toast.error('Failed to create variant'),
  })

  const updateVariantMutation = useMutation({
    mutationFn: ({ id, variant }: { id: number; variant: any }) => variantService.updateVariant(id, variant),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['product-variants'] })
      setShowVariantModal(false)
      setEditingVariant(null)
      toast.success('Variant updated successfully')
    },
    onError: () => toast.error('Failed to update variant'),
  })

  const deleteVariantMutation = useMutation({
    mutationFn: (id: number) => variantService.deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] })
      queryClient.invalidateQueries({ queryKey: ['product-variants'] })
      toast.success('Variant deleted successfully')
    },
    onError: () => toast.error('Failed to delete variant'),
  })

  const products = data?.items || []
  const totalPages = data?.totalPages || 0

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price)
  }

  if (showAddView) {
    return (
      <AddProductView 
        categories={categories}
        onClose={() => setShowAddView(false)}
        onSubmit={(product) => createMutation.mutate(product)}
        isLoading={createMutation.isPending}
      />
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500">Manage your product catalog</p>
        </div>
        <button 
          onClick={() => setShowAddView(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Product
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPageIndex(0)
                }}
                className="input pl-10"
              />
            </div>
            <select className="input w-auto">
              <option>All Categories</option>
              <option>Electronics</option>
              <option>Clothing</option>
              <option>Home</option>
            </select>
            <select className="input w-auto">
              <option>All Status</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-8 text-center text-gray-500">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No products found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg overflow-hidden">
                          {product.mainImageUrl && (
                            <img src={product.mainImageUrl} alt="" className="w-full h-full object-cover" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.isFeatured && (
                            <span className="text-xs text-primary-600">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.sku || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{product.categoryName}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatPrice(product.price)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-sm ${
                        product.stockQuantity === 0 ? 'text-red-600' : 
                        product.stockQuantity < 10 ? 'text-yellow-600' : 'text-gray-900'
                      }`}>
                        {product.stockQuantity}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${
                        product.stockStatus === 'InStock' ? 'badge-success' : 
                        product.stockStatus === 'LowStock' ? 'badge-warning' : 'badge-danger'
                      }`}>
                        {product.stockStatus === 'InStock' ? 'Active' : product.stockStatus === 'LowStock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => { setSelectedProduct(product); setShowVariantModal(true); }}
                          className="p-1 text-gray-400 hover:text-primary-600" 
                          title="Manage Variants"
                        >
                          <Layers className="h-5 w-5" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-primary-600">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-primary-600">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 0 && (
          <div className="p-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Showing {pageIndex * 10 + 1} to {Math.min((pageIndex + 1) * 10, data?.totalCount || 0)} of {data?.totalCount || 0} products
            </p>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPageIndex(p => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const page = pageIndex < 3 ? i : pageIndex > totalPages - 3 ? totalPages - 5 + i : pageIndex - 2 + i
                if (page < 0 || page >= totalPages) return null
                return (
                  <button
                    key={page}
                    onClick={() => setPageIndex(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      pageIndex === page 
                        ? 'bg-primary-600 text-white' 
                        : 'border border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {page + 1}
                  </button>
                )
              })}
              <button 
                onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
                disabled={pageIndex >= totalPages - 1}
                className="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {showVariantModal && selectedProduct && (
        <VariantModal
          product={selectedProduct}
          onClose={() => { setShowVariantModal(false); setSelectedProduct(null); }}
          onCreateVariant={(v) => createVariantMutation.mutate(v)}
          onUpdateVariant={(id, v) => updateVariantMutation.mutate({ id, variant: v })}
          onDeleteVariant={(id) => deleteVariantMutation.mutate(id)}
          isCreating={createVariantMutation.isPending}
          isUpdating={updateVariantMutation.isPending}
        />
      )}
    </div>
  )
}

function AddProductView({ 
  categories, 
  onClose, 
  onSubmit, 
  isLoading 
}: { 
  categories: Category[]
  onClose: () => void
  onSubmit: (product: CreateProductRequest) => void
  isLoading: boolean
}) {
  const [formData, setFormData] = useState<CreateProductRequest>({
    name: '',
    sku: '',
    shortDescription: '',
    description: '',
    price: 0,
    oldPrice: undefined,
    costPrice: 0,
    categoryId: categories[0]?.id || 0,
    isFeatured: false,
    isBestSeller: false,
    isNewArrival: false,
    minimumStockLevel: 10,
    reorderLevel: 5,
    weight: 0,
  })

  // Additional UI state matching AddProduct.tsx
  const [brand, setBrand] = useState('')
  const [unit, setUnit] = useState('')
  const [condition, setCondition] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [productType, setProductType] = useState('single')
  const [taxProfile, setTaxProfile] = useState('GST')
  const [refundable, setRefundable] = useState(false)

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value) {
      e.preventDefault()
      setTags([...tags, e.currentTarget.value])
      e.currentTarget.value = ''
    }
  }

  const handleSubmit = (e: React.FormEvent, publish: boolean) => {
    e.preventDefault()
    // You could map additional UI state here if your backend models are expanded in the future
    onSubmit(formData)
  }

  return (
    <div className="bg-white rounded shadow max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
        </div>
      </div>
      
      <form onSubmit={e => handleSubmit(e, true)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Product Name *</label>
            <input
              type="text"
              required
              className="input w-full"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Category *</label>
            <select
              required
              className="input w-full"
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: parseInt(e.target.value) })}
            >
              <option value="">Select Category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">SKU</label>
            <input
              type="text"
              className="input w-full"
              value={formData.sku || ''}
              onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (BDT) *</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cost Price (BDT) *</label>
            <input
              type="number"
              required
              className="input w-full"
              value={formData.costPrice}
              onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Brand</label>
            <select className="input w-full" value={brand} onChange={e => setBrand(e.target.value)}>
              <option value="">Select product brand</option>
              <option value="brand1">Brand 1</option>
              <option value="brand2">Brand 2</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Unit</label>
            <select className="input w-full" value={unit} onChange={e => setUnit(e.target.value)}>
              <option value="">Select unit</option>
              <option value="piece">Piece</option>
              <option value="kg">Kg</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Condition</label>
            <select className="input w-full" value={condition} onChange={e => setCondition(e.target.value)}>
              <option value="">Select condition</option>
              <option value="export">Export Quality</option>
              <option value="new">New</option>
              <option value="used">Used</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Weight (kg)</label>
            <input
              type="number"
              step="0.01"
              className="input w-full"
              value={formData.weight}
              onChange={(e) => setFormData({ ...formData, weight: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Tags</label>
            <input
              type="text"
              className="input w-full"
              placeholder="Select or insert product tags and press Enter"
              onKeyDown={handleTagInput}
            />
            <div className="flex flex-wrap mt-2">
              {tags.map((tag, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 mb-2 text-xs flex items-center gap-1">
                  {tag}
                  <button type="button" onClick={() => setTags(tags.filter((_, i) => i !== idx))} className="hover:text-red-500">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Short Description</label>
            <textarea
              className="input w-full"
              rows={2}
              value={formData.shortDescription || ''}
              onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="input w-full"
              rows={4}
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
        </div>

        <div className="mt-6">
          <label className="block mb-2 font-medium">Product Type</label>
          <div className="flex gap-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="productType"
                value="single"
                checked={productType === 'single'}
                onChange={() => setProductType('single')}
                className="mr-2"
              />
              Single Product
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="productType"
                value="variant"
                checked={productType === 'variant'}
                onChange={() => setProductType('variant')}
                className="mr-2"
              />
              Variant Product
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <label className="block mb-1 font-medium">Tax Profile</label>
            <select className="input w-full" value={taxProfile} onChange={e => setTaxProfile(e.target.value)}>
              <option value="GST">GST</option>
              <option value="VAT">VAT</option>
              <option value="None">None</option>
            </select>
            <p className="text-xs text-gray-500 mt-1">You can create new tax profile or manage profiles from Tax Module</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="font-medium text-sm">Featured Product</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={formData.isFeatured} onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} />
                <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${formData.isFeatured ? 'bg-primary-600' : ''}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${formData.isFeatured ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="font-medium text-sm">Best Seller</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={formData.isBestSeller} onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })} />
                <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${formData.isBestSeller ? 'bg-primary-600' : ''}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${formData.isBestSeller ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="font-medium text-sm">New Arrival</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={formData.isNewArrival} onChange={(e) => setFormData({ ...formData, isNewArrival: e.target.checked })} />
                <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${formData.isNewArrival ? 'bg-primary-600' : ''}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${formData.isNewArrival ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
              <span className="font-medium text-sm">Refundable</span>
              <label className="inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only" checked={refundable} onChange={() => setRefundable(!refundable)} />
                <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${refundable ? 'bg-primary-600' : ''}`}>
                  <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${refundable ? 'translate-x-5' : ''}`}></div>
                </div>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4 mt-8 pt-6 border-t">
          <button
            type="button"
            className="btn-secondary px-6 py-2"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 font-medium transition-colors"
            onClick={(e) => handleSubmit(e, false)}
            disabled={isLoading}
          >
            Save as Draft
          </button>
          <button
            type="submit"
            className="btn-primary px-8 py-2 shadow-sm"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save & Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}

function VariantModal({ 
  product, 
  onClose,
  onCreateVariant,
  onUpdateVariant,
  onDeleteVariant,
  isCreating,
  isUpdating,
}: { 
  product: any
  onClose: () => void
  onCreateVariant: (v: CreateVariantRequest) => void
  onUpdateVariant: (id: number, v: any) => void
  onDeleteVariant: (id: number) => void
  isCreating: boolean
  isUpdating: boolean
}) {
  const [variantForm, setVariantForm] = useState({
    name: '',
    sku: '',
    price: 0,
    costPrice: 0,
    stockQuantity: 0,
    size: '',
    color: '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const attributes: any[] = []
    if (variantForm.size) attributes.push({ attributeId: 1, value: variantForm.size })
    if (variantForm.color) attributes.push({ attributeId: 2, value: variantForm.color })

    onCreateVariant({
      productId: product.id,
      name: variantForm.name || `${product.name} - ${variantForm.color || ''} ${variantForm.size || ''}`.trim(),
      sku: variantForm.sku,
      price: variantForm.price || product.price,
      costPrice: variantForm.costPrice || product.price * 0.6,
      stockQuantity: variantForm.stockQuantity,
      isActive: true,
      attributes,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Package className="h-6 w-6 text-primary-600" />
            <div>
              <h2 className="text-xl font-bold">Manage Variants</h2>
              <p className="text-sm text-gray-500">{product.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <h3 className="font-semibold text-lg">Add New Variant</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Variant Name</label>
              <input
                type="text"
                className="input w-full"
                placeholder="e.g., iPhone 14 Pro 256GB"
                value={variantForm.name}
                onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">SKU</label>
              <input
                type="text"
                className="input w-full"
                value={variantForm.sku}
                onChange={(e) => setVariantForm({ ...variantForm, sku: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Price (BDT)</label>
              <input
                type="number"
                className="input w-full"
                value={variantForm.price || product.price}
                onChange={(e) => setVariantForm({ ...variantForm, price: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cost Price (BDT)</label>
              <input
                type="number"
                className="input w-full"
                value={variantForm.costPrice}
                onChange={(e) => setVariantForm({ ...variantForm, costPrice: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Stock Quantity</label>
              <input
                type="number"
                className="input w-full"
                value={variantForm.stockQuantity}
                onChange={(e) => setVariantForm({ ...variantForm, stockQuantity: parseInt(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <select 
                className="input w-full"
                value={variantForm.size}
                onChange={(e) => setVariantForm({ ...variantForm, size: e.target.value })}
              >
                <option value="">Select Size</option>
                <option value="S">Small</option>
                <option value="M">Medium</option>
                <option value="L">Large</option>
                <option value="XL">XL</option>
                <option value="XXL">XXL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Color</label>
              <select 
                className="input w-full"
                value={variantForm.color}
                onChange={(e) => setVariantForm({ ...variantForm, color: e.target.value })}
              >
                <option value="">Select Color</option>
                <option value="Red">Red</option>
                <option value="Blue">Blue</option>
                <option value="Green">Green</option>
                <option value="Black">Black</option>
                <option value="White">White</option>
                <option value="Gray">Gray</option>
                <option value="Navy">Navy</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-2">
              Cancel
            </button>
            <button type="submit" className="btn-primary px-6 py-2" disabled={isCreating}>
              {isCreating ? 'Adding...' : 'Add Variant'}
            </button>
          </div>
        </form>

        {product.variants && product.variants.length > 0 && (
          <div className="p-6 border-t">
            <h3 className="font-semibold text-lg mb-4">Existing Variants ({product.variants.length})</h3>
            <div className="space-y-3">
              {product.variants.map((variant: ProductVariant) => (
                <div key={variant.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                  <div>
                    <p className="font-medium">{variant.name}</p>
                    <p className="text-sm text-gray-500">
                      SKU: {variant.sku || 'N/A'} | Price: Tk {variant.price} | Stock: {variant.stockQuantity}
                    </p>
                    {variant.attributeValues.length > 0 && (
                      <p className="text-xs text-gray-400">
                        {variant.attributeValues.map(a => `${a.attributeName}: ${a.value}`).join(', ')}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs rounded ${variant.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {variant.isActive ? 'Active' : 'Inactive'}
                    </span>
                    <button 
                      onClick={() => onDeleteVariant(variant.id)}
                      className="p-1 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

