import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Star, StarOff, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface Brand {
  id: number
  name: string
  slug: string
  description?: string
  logoUrl?: string
  website?: string
  isFeatured: boolean
  isActive: boolean
  productCount?: number
}

interface BrandFormData {
  name: string
  description: string
  website: string
  logoUrl: string
  isFeatured: boolean
  isActive: boolean
}

export default function AdminBrands() {
  const [searchTerm, setSearchTerm] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null)
  const [formData, setFormData] = useState<BrandFormData>({
    name: '',
    description: '',
    website: '',
    logoUrl: '',
    isFeatured: false,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (editingBrand) {
      setFormData({
        name: editingBrand.name,
        description: editingBrand.description || '',
        website: editingBrand.website || '',
        logoUrl: editingBrand.logoUrl || '',
        isFeatured: editingBrand.isFeatured,
        isActive: editingBrand.isActive,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        website: '',
        logoUrl: '',
        isFeatured: false,
        isActive: true,
      })
    }
  }, [editingBrand])

  const fetchBrands = async () => {
    setLoading(true)
    try {
      const response = await api.get('/brands?pageIndex=0&pageSize=100')
      setBrands(response.data.data.items)
    } catch (error) {
      toast.error('Failed to fetch brands')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingBrand) {
        await api.put(`/brands/${editingBrand.id}`, formData)
        toast.success('Brand updated successfully')
      } else {
        await api.post('/brands', formData)
        toast.success('Brand created successfully')
      }
      setShowModal(false)
      setEditingBrand(null)
      fetchBrands()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save brand')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeatured = async (id: number) => {
    try {
      await api.post(`/brands/${id}/toggle-featured`)
      toast.success('Featured status updated')
      fetchBrands()
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this brand?')) return
    
    try {
      await api.delete(`/brands/${id}`)
      toast.success('Brand deleted')
      fetchBrands()
    } catch (error) {
      toast.error('Failed to delete brand')
    }
  }

  const openModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand)
    } else {
      setEditingBrand(null)
    }
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500">Manage product brands</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Brand
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search brands..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading brands...</div>
          ) : brands.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No brands found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Brand</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Website</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {brands.map((brand) => (
                  <tr key={brand.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {brand.logoUrl ? (
                          <img src={brand.logoUrl} alt={brand.name} className="w-10 h-10 object-contain" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <span className="text-gray-500 font-bold">{brand.name.charAt(0)}</span>
                          </div>
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{brand.name}</p>
                          {brand.description && (
                            <p className="text-sm text-gray-500 truncate max-w-xs">{brand.description}</p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{brand.slug}</td>
                    <td className="px-6 py-4 text-sm text-blue-600">
                      {brand.website ? (
                        <a href={brand.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                          Visit
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(brand.id)}
                        className={`p-1 rounded ${brand.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        {brand.isFeatured ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${brand.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {brand.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(brand)} className="p-1 text-gray-400 hover:text-primary-600">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(brand.id)} className="p-1 text-gray-400 hover:text-red-600">
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
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingBrand ? 'Edit Brand' : 'Add Brand'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Brand Name *</label>
                <input
                  type="text"
                  required
                  className="input w-full"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  className="input w-full"
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <input
                  type="url"
                  className="input w-full"
                  placeholder="https://example.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Logo URL</label>
                <input
                  type="url"
                  className="input w-full"
                  placeholder="https://example.com/logo.png"
                  value={formData.logoUrl}
                  onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  />
                  <span className="text-sm">Featured</span>
                </label>
                {editingBrand && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                    <span className="text-sm">Active</span>
                  </label>
                )}
              </div>
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary">
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
