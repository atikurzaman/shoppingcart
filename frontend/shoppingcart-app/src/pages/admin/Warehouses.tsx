import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Warehouse, MapPin, Package, AlertTriangle, X } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface Warehouse {
  id: number
  name: string
  code?: string
  description?: string
  address?: string
  city?: string
  country?: string
  phone?: string
  email?: string
  isMainWarehouse: boolean
  isActive: boolean
  totalProducts: number
  lowStockItems: number
  totalStockValue: number
}

interface WarehouseFormData {
  name: string
  code: string
  description: string
  address: string
  city: string
  country: string
  phone: string
  email: string
  isMainWarehouse: boolean
  isActive: boolean
}

export default function AdminWarehouses() {
  const [searchTerm, setSearchTerm] = useState('')
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null)
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    code: '',
    description: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    isMainWarehouse: false,
    isActive: true,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    fetchWarehouses()
  }, [])

  useEffect(() => {
    if (editingWarehouse) {
      setFormData({
        name: editingWarehouse.name,
        code: editingWarehouse.code || '',
        description: editingWarehouse.description || '',
        address: editingWarehouse.address || '',
        city: editingWarehouse.city || '',
        country: editingWarehouse.country || '',
        phone: editingWarehouse.phone || '',
        email: editingWarehouse.email || '',
        isMainWarehouse: editingWarehouse.isMainWarehouse,
        isActive: editingWarehouse.isActive,
      })
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        address: '',
        city: '',
        country: '',
        phone: '',
        email: '',
        isMainWarehouse: false,
        isActive: true,
      })
    }
  }, [editingWarehouse])

  const fetchWarehouses = async () => {
    setLoading(true)
    try {
      const response = await api.get('/warehouses?pageIndex=0&pageSize=100')
      setWarehouses(response.data.data.items)
    } catch (error) {
      toast.error('Failed to fetch warehouses')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      if (editingWarehouse) {
        await api.put(`/warehouses/${editingWarehouse.id}`, formData)
        toast.success('Warehouse updated successfully')
      } else {
        await api.post('/warehouses', formData)
        toast.success('Warehouse created successfully')
      }
      setShowModal(false)
      setEditingWarehouse(null)
      fetchWarehouses()
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to save warehouse')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this warehouse?')) return
    
    try {
      await api.delete(`/warehouses/${id}`)
      toast.success('Warehouse deleted')
      fetchWarehouses()
    } catch (error) {
      toast.error('Failed to delete warehouse')
    }
  }

  const openModal = (warehouse?: Warehouse) => {
    if (warehouse) {
      setEditingWarehouse(warehouse)
    } else {
      setEditingWarehouse(null)
    }
    setShowModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Warehouses</h1>
          <p className="text-gray-500">Manage inventory warehouses</p>
        </div>
        <button onClick={() => openModal()} className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Warehouse
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {warehouses.filter(w => w.isMainWarehouse).map((warehouse) => (
          <div key={warehouse.id} className="card p-6 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  <Warehouse className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold">{warehouse.name}</h3>
                  <p className="text-sm text-white/80">{warehouse.code}</p>
                </div>
              </div>
              <span className="px-2 py-1 bg-white/20 rounded text-xs font-medium">Main</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-white/80">Products</p>
                <p className="text-xl font-bold">{warehouse.totalProducts}</p>
              </div>
              <div>
                <p className="text-sm text-white/80">Stock Value</p>
                <p className="text-xl font-bold">Tk {warehouse.totalStockValue.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search warehouses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center text-gray-500">Loading warehouses...</div>
          ) : warehouses.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No warehouses found</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Location</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Products</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Low Stock</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {warehouses.map((warehouse) => (
                  <tr key={warehouse.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Warehouse className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{warehouse.name}</p>
                          <p className="text-sm text-gray-500">{warehouse.code}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {[warehouse.city, warehouse.country].filter(Boolean).join(', ') || '-'}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Package className="h-3 w-3" />
                        {warehouse.totalProducts}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      {warehouse.lowStockItems > 0 ? (
                        <p className="text-sm text-red-600 flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {warehouse.lowStockItems}
                        </p>
                      ) : (
                        <span className="text-sm text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      Tk {warehouse.totalStockValue.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`badge ${warehouse.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {warehouse.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openModal(warehouse)} className="p-1 text-gray-400 hover:text-primary-600">
                          <Edit className="h-5 w-5" />
                        </button>
                        <button onClick={() => handleDelete(warehouse.id)} className="p-1 text-gray-400 hover:text-red-600">
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
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-xl font-bold">
                {editingWarehouse ? 'Edit Warehouse' : 'Add Warehouse'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Warehouse Name *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Code *</label>
                  <input
                    type="text"
                    required
                    className="input w-full"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  />
                </div>
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
                <label className="block text-sm font-medium mb-1">Address</label>
                <input
                  type="text"
                  className="input w-full"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">City</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Country</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <input
                    type="text"
                    className="input w-full"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    className="input w-full"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.isMainWarehouse}
                    onChange={(e) => setFormData({ ...formData, isMainWarehouse: e.target.checked })}
                  />
                  <span className="text-sm">Main Warehouse</span>
                </label>
                {editingWarehouse && (
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
