import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Star, StarOff, ArrowLeft } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parentCategoryId?: number
  displayOrder: number
  isFeatured: boolean
  isActive: boolean
  productCount?: number
}

interface CategoryFormData {
  name: string
  description: string
  parentCategoryId?: number
  displayOrder: number
  isFeatured: boolean
  isActive: boolean
}

export default function AdminCategories() {
  const [searchTerm, setSearchTerm] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState<CategoryFormData>({
    name: '',
    description: '',
    parentCategoryId: undefined,
    displayOrder: 0,
    isFeatured: false,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (editingCategory) {
      setFormData({
        name: editingCategory.name,
        description: editingCategory.description || '',
        parentCategoryId: editingCategory.parentCategoryId,
        displayOrder: editingCategory.displayOrder,
        isFeatured: editingCategory.isFeatured,
        isActive: editingCategory.isActive,
      })
    } else {
      setFormData({
        name: '',
        description: '',
        parentCategoryId: undefined,
        displayOrder: 0,
        isFeatured: false,
        isActive: true,
      })
    }
  }, [editingCategory])

  const fetchCategories = async () => {
    setLoading(true)
    try {
      const response = await api.get('/categories/all')
      setCategories(response.data.data)
    } catch (error) {
      toast.error('Failed to fetch categories')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData)
        toast.success('Category updated successfully')
      } else {
        await api.post('/categories', formData)
        toast.success('Category created successfully')
      }
      setShowForm(false)
      setEditingCategory(null)
      fetchCategories()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save category')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleFeatured = async (id: number, currentStatus: boolean) => {
    try {
      await api.post(`/categories/${id}/toggle-featured`)
      toast.success('Featured status updated')
      fetchCategories()
    } catch (error) {
      toast.error('Failed to update featured status')
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this category?')) return
    
    try {
      await api.delete(`/categories/${id}`)
      toast.success('Category deleted')
      fetchCategories()
    } catch (error) {
      toast.error('Failed to delete category')
    }
  }

  const openForm = (category?: Category) => {
    if (category) {
      setEditingCategory(category)
    } else {
      setEditingCategory(null)
    }
    setShowForm(true)
  }

  if (showForm) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded shadow">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {editingCategory ? 'Edit Category' : 'Add New Category'}
          </h1>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-sm">Category Name *</label>
              <input
                type="text"
                required
                className="input w-full"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter category name"
              />
            </div>
            
            <div>
              <label className="block mb-1 font-medium text-sm">Parent Category</label>
              <select
                className="input w-full"
                value={formData.parentCategoryId || ''}
                onChange={(e) => setFormData({ ...formData, parentCategoryId: e.target.value ? parseInt(e.target.value) : undefined })}
              >
                <option value="">None (Top Level)</option>
                {categories.filter(c => c.id !== editingCategory?.id).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block mb-1 font-medium text-sm">Display Order</label>
              <input
                type="number"
                className="input w-full"
                value={formData.displayOrder}
                onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
              />
            </div>
            
            <div className="md:col-span-2">
              <label className="block mb-1 font-medium text-sm">Description</label>
              <textarea
                className="input w-full"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter description"
                rows={3}
              />
            </div>
            
            <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <span className="font-medium text-sm block">Featured Status</span>
                  <span className="text-xs text-gray-500">Show in featured sections</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.isFeatured} 
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })} 
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${formData.isFeatured ? 'bg-primary-600' : ''}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${formData.isFeatured ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                <div>
                  <span className="font-medium text-sm block">Active Status</span>
                  <span className="text-xs text-gray-500">Enable or disable category</span>
                </div>
                <label className="inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only" 
                    checked={formData.isActive} 
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })} 
                  />
                  <div className={`w-11 h-6 bg-gray-200 rounded-full transition-colors ${formData.isActive ? 'bg-primary-600' : ''}`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ml-0.5 ${formData.isActive ? 'translate-x-5' : ''}`}></div>
                  </div>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-4 pt-4 border-t mt-6">
            <button
              type="button"
              className="btn-secondary px-6 py-2"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 py-2 shadow-sm"
            >
              {isSubmitting ? 'Saving...' : (editingCategory ? 'Update Category' : 'Save Category')}
            </button>
          </div>
        </form>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500">Manage product categories</p>
        </div>
        <button 
          onClick={() => openForm()}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          Add Category
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading categories...</div>
          ) : categories.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No categories found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Featured</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-gray-500 truncate max-w-xs">{category.description}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {category.parentCategoryId 
                        ? categories.find(c => c.id === category.parentCategoryId)?.name || '-' 
                        : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{category.slug}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{category.displayOrder}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleFeatured(category.id, category.isFeatured)}
                        className={`p-1 rounded ${category.isFeatured ? 'text-yellow-500' : 'text-gray-300 hover:text-yellow-500'}`}
                      >
                        {category.isFeatured ? <Star className="h-5 w-5 fill-current" /> : <StarOff className="h-5 w-5" />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${category.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => openForm(category)}
                          className="p-1 text-gray-400 hover:text-primary-600"
                        >
                          <Edit className="h-5 w-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
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
    </div>
  )
}
