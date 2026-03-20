import { useState } from 'react'
import { Search, Package, AlertTriangle, Plus, Minus, RefreshCw } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface StockItem {
  id: number
  productId: number
  productName: string
  productSKU: string
  productImageUrl: string
  warehouseId: number
  warehouseName: string
  quantity: number
  reservedQuantity: number
  availableQuantity: number
  price: number
  stockValue: number
  isLowStock: boolean
  isOutOfStock: boolean
  lastUpdated: string
}

export default function AdminInventory() {
  const [searchTerm, setSearchTerm] = useState('')
  const [stockItems, setStockItems] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(false)
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedItem, setSelectedItem] = useState<StockItem | null>(null)
  const [adjustQuantity, setAdjustQuantity] = useState(0)
  const [adjustReason, setAdjustReason] = useState('')
  const [lowStockOnly, setLowStockOnly] = useState(false)

  const fetchStockItems = async () => {
    setLoading(true)
    try {
      const params: any = { pageIndex: 0, pageSize: 100 }
      if (searchTerm) params.search = searchTerm
      if (lowStockOnly) params.lowStock = true

      const response = await api.get('/inventory/stock-items', { params })
      setStockItems(response.data.data.items)
    } catch (error) {
      toast.error('Failed to fetch stock items')
    } finally {
      setLoading(false)
    }
  }

  const handleAdjustStock = async () => {
    if (!selectedItem || adjustQuantity < 0 || !adjustReason) {
      toast.error('Please fill all required fields')
      return
    }

    try {
      await api.post('/inventory/adjust', {
        productId: selectedItem.productId,
        warehouseId: selectedItem.warehouseId,
        quantity: adjustQuantity,
        reason: adjustReason
      })
      toast.success('Stock adjusted successfully')
      setShowAdjustModal(false)
      setSelectedItem(null)
      setAdjustQuantity(0)
      setAdjustReason('')
      fetchStockItems()
    } catch (error) {
      toast.error('Failed to adjust stock')
    }
  }

  const openAdjustModal = (item: StockItem) => {
    setSelectedItem(item)
    setAdjustQuantity(item.quantity)
    setShowAdjustModal(true)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500">Manage stock levels and inventory</p>
        </div>
        <button
          onClick={fetchStockItems}
          className="btn-secondary flex items-center gap-2"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Package className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Items</p>
              <p className="text-2xl font-bold">{stockItems.length}</p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Package className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">In Stock</p>
              <p className="text-2xl font-bold">
                {stockItems.filter(i => !i.isOutOfStock && !i.isLowStock).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Low Stock</p>
              <p className="text-2xl font-bold">
                {stockItems.filter(i => i.isLowStock).length}
              </p>
            </div>
          </div>
        </div>
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-100 rounded-lg">
              <Package className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Out of Stock</p>
              <p className="text-2xl font-bold">
                {stockItems.filter(i => i.isOutOfStock).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchStockItems()}
                className="input pl-10"
              />
            </div>
            <button
              onClick={() => { setLowStockOnly(!lowStockOnly); fetchStockItems() }}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                lowStockOnly ? 'bg-yellow-500 text-white' : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
              }`}
            >
              <AlertTriangle className="h-4 w-4 inline mr-1" />
              Low Stock Only
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">SKU</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Warehouse</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reserved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Value</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stockItems.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {item.productImageUrl ? (
                        <img src={item.productImageUrl} alt={item.productName} className="w-10 h-10 object-cover rounded" />
                      ) : (
                        <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                          <Package className="h-5 w-5 text-gray-400" />
                        </div>
                      )}
                      <p className="font-medium text-gray-900">{item.productName}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.productSKU || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.warehouseName}</td>
                  <td className="px-6 py-4">
                    <span className={`font-medium ${
                      item.isOutOfStock ? 'text-red-600' : 
                      item.isLowStock ? 'text-yellow-600' : 'text-gray-900'
                    }`}>
                      {item.availableQuantity}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.reservedQuantity}</td>
                  <td className="px-6 py-4">
                    {item.isOutOfStock ? (
                      <span className="badge badge-danger">Out of Stock</span>
                    ) : item.isLowStock ? (
                      <span className="badge badge-warning">Low Stock</span>
                    ) : (
                      <span className="badge badge-success">In Stock</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    Tk {item.stockValue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => openAdjustModal(item)}
                      className="text-primary-600 hover:text-primary-800 text-sm font-medium"
                    >
                      Adjust Stock
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-bold mb-4">Adjust Stock</h3>
            <p className="text-sm text-gray-500 mb-4">
              {selectedItem.productName}
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="label">New Quantity</label>
                <input
                  type="number"
                  min="0"
                  value={adjustQuantity}
                  onChange={(e) => setAdjustQuantity(parseInt(e.target.value) || 0)}
                  className="input"
                />
              </div>
              
              <div>
                <label className="label">Reason</label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="input"
                >
                  <option value="">Select a reason</option>
                  <option value="Stock Count">Stock Count</option>
                  <option value="Damaged Goods">Damaged Goods</option>
                  <option value="Returned Items">Returned Items</option>
                  <option value="Lost in Transit">Lost in Transit</option>
                  <option value="Received Shipment">Received Shipment</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-500">Current:</span>
                <span className="font-medium">{selectedItem.quantity}</span>
                <span className="text-gray-500 mx-2">→</span>
                <span className="text-gray-500">New:</span>
                <span className={`font-medium ${adjustQuantity !== selectedItem.quantity ? 'text-primary-600' : ''}`}>
                  {adjustQuantity}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAdjustModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustStock}
                className="flex-1 btn-primary"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
