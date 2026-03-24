import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Eye, X, ArrowLeft, Package, Layers } from 'lucide-react'
import { productService, CreateProductRequest, categoryService, Category, variantService, ProductVariant, CreateVariantRequest } from '../../services/productService'
import toast from 'react-hot-toast'
import api from '../../services/api'

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

      <div className="card-premium overflow-hidden">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search products by name or SKU..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value)
                  setPageIndex(0)
                }}
                className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
              />
            </div>
            <div className="flex items-center gap-3">
              <select className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary-100">
                <option>All Categories</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary-100">
                <option>All Stocks</option>
                <option>In Stock</option>
                <option>Low Stock</option>
                <option>Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-gray-500 font-medium">Loading products...</p>
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No products found</h4>
              <p className="text-gray-500">Try adjusting your search or filters.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Product Information</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">SKU</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Pricing</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Inventory</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-2xl overflow-hidden border border-gray-100 flex-shrink-0 group-hover:border-primary-200 transition-colors">
                          {product.mainImageUrl ? (
                            <img src={product.mainImageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                <Package className="w-6 h-6" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{product.name}</p>
                          <p className="text-xs text-gray-400 font-bold mt-0.5">{product.categoryName}</p>
                          <div className="flex gap-1.5 mt-2">
                            {product.isFeatured && (
                                <span className="px-2 py-0.5 rounded-md bg-yellow-50 text-[10px] font-black text-yellow-600 border border-yellow-100 uppercase tracking-tighter">Featured</span>
                            )}
                            {product.isNewArrival && (
                                <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[10px] font-black text-blue-600 border border-blue-100 uppercase tracking-tighter">New</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg tracking-wider">{product.sku || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-sm font-black text-gray-900">{formatPrice(product.price)}</p>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className={`text-sm font-black ${
                            product.stockQuantity === 0 ? 'text-red-500' : 
                            product.stockQuantity < 10 ? 'text-orange-500' : 'text-gray-900'
                        }`}>
                            {product.stockQuantity} Units
                        </span>
                        <div className="w-20 h-1.5 bg-gray-100 rounded-full mt-2 overflow-hidden">
                            <div 
                                className={`h-full rounded-full ${
                                    product.stockQuantity === 0 ? 'bg-red-500' : 
                                    product.stockQuantity < 10 ? 'bg-orange-500' : 'bg-green-500'
                                }`} 
                                style={{ width: `${Math.min(100, (product.stockQuantity / 50) * 100)}%` }}
                            />
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        product.stockStatus === 'InStock' ? 'bg-green-100 text-green-700' : 
                        product.stockStatus === 'LowStock' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {product.stockStatus === 'InStock' ? 'Active' : product.stockStatus === 'LowStock' ? 'Low Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button 
                          onClick={() => { setSelectedProduct(product); setShowVariantModal(true); }}
                          className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all" 
                          title="Manage Variants"
                        >
                          <Layers className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                          <Eye className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all">
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

  const [images, setImages] = useState<{ imageUrl: string, isMain: boolean, displayOrder: number }[]>([])
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('file', file)

    setIsUploadingImage(true)
    try {
      const response = await api.post('/Upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      const newImage = { 
        imageUrl: response.data.url,
        isMain: images.length === 0,
        displayOrder: images.length 
      }
      setImages([...images, newImage])
      setFormData(prev => ({ 
        ...prev, 
        images: [...(prev.images || []), newImage] 
      }))
      toast.success('Image uploaded successfully')
    } catch (error) {
      toast.error('Failed to upload image')
    } finally {
      setIsUploadingImage(false)
    }
  }

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
            <label className="block text-sm font-medium mb-1">Product Images</label>
            <div className="flex flex-wrap gap-4 items-center">
              {images.map((img, idx) => (
                <div key={idx} className="relative w-24 h-24 border rounded-lg overflow-hidden bg-gray-50">
                  <img src={img.imageUrl} alt="preview" className="w-full h-full object-cover" />
                  <button 
                    type="button" 
                    onClick={() => {
                       const newImages = images.filter((_, i) => i !== idx)
                       setImages(newImages)
                       setFormData(prev => ({ ...prev, images: newImages }))
                    }} 
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-600">
                    <X className="w-3 h-3" />
                  </button>
                  {img.isMain && <span className="absolute bottom-0 left-0 right-0 bg-primary-600 text-white text-[10px] text-center py-0.5">Main</span>}
                </div>
              ))}
              <div className="w-24 h-24 border-2 border-dashed rounded-lg flex items-center justify-center relative hover:bg-gray-50 cursor-pointer overflow-hidden">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploadingImage} />
                <div className="text-center">
                  <Plus className="w-6 h-6 mx-auto text-gray-400" />
                  <span className="text-xs text-gray-500">{isUploadingImage ? 'Uploading...' : 'Add Image'}</span>
                </div>
              </div>
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
    imageUrl: '',
  })
  
  const [isUploadingImage, setIsUploadingImage] = useState(false)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append('file', file)

    setIsUploadingImage(true)
    try {
      const response = await api.post('/Upload/image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      setVariantForm(prev => ({ ...prev, imageUrl: response.data.url }))
      toast.success('Variant image uploaded')
    } catch (error) {
      toast.error('Failed to upload variant image')
    } finally {
      setIsUploadingImage(false)
    }
  }

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
      imageUrl: variantForm.imageUrl,
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
          
          <div>
             <label className="block text-sm font-medium mb-1">Variant Image</label>
             <div className="flex items-center gap-4">
               {variantForm.imageUrl ? (
                 <div className="relative w-20 h-20 border rounded-lg overflow-hidden bg-gray-50">
                    <img src={variantForm.imageUrl} alt="preview" className="w-full h-full object-cover" />
                    <button 
                      type="button" 
                      onClick={() => setVariantForm({ ...variantForm, imageUrl: '' })} 
                      className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-600">
                      <X className="w-3 h-3" />
                    </button>
                 </div>
               ) : (
                 <div className="w-20 h-20 border-2 border-dashed rounded-lg flex items-center justify-center relative hover:bg-gray-50 cursor-pointer overflow-hidden">
                   <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={isUploadingImage} />
                   <div className="text-center">
                     <Plus className="w-5 h-5 mx-auto text-gray-400" />
                     <span className="text-xs text-gray-500">{isUploadingImage ? 'Uploading...' : 'Add'}</span>
                   </div>
                 </div>
               )}
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

