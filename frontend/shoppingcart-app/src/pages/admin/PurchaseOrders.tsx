import { useState, useEffect } from 'react'
import { Search, Plus, Filter, ShoppingBag, Truck, CheckCircle2, MoreVertical, Eye, FileText, Package, PlusCircle, Trash2, ArrowRight } from 'lucide-react'
import { procurementApi, CreatePurchaseOrderRequest, PurchaseOrder } from '../../services/procurementApi'
import api from '../../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface Supplier {
  id: number
  name: string
}

interface Product {
  id: number
  name: string
  sku?: string
}

export default function AdminPurchaseOrders() {
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  
  // Create PO form state
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [selectedSupplier, setSelectedSupplier] = useState<number>(0)
  const [expectedDate, setExpectedDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<{ productId: number; quantity: number; unitPrice: number }[]>([])

  useEffect(() => {
    fetchPurchaseOrders()
    fetchSuppliers()
    fetchProducts()
  }, [searchTerm, statusFilter])

  const fetchPurchaseOrders = async () => {
    setLoading(true)
    try {
      const data = await procurementApi.getPurchaseOrders({
        search: searchTerm,
        status: statusFilter,
        pageIndex: 0,
        pageSize: 100
      })
      setPurchaseOrders(data.items)
    } catch (error) {
      toast.error('Failed to fetch purchase orders')
    } finally {
      setLoading(false)
    }
  }

  const fetchSuppliers = async () => {
    try {
      const { data } = await api.get('/suppliers/all')
      setSuppliers(data.data)
    } catch (error) {}
  }

  const fetchProducts = async () => {
    try {
      const { data } = await api.get('/products', { params: { pageSize: 1000 } })
      setProducts(data.data.items)
    } catch (error) {}
  }

  const handleAddItem = () => {
    setItems([...items, { productId: 0, quantity: 1, unitPrice: 0 }])
  }

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items]
    newItems[index] = { ...newItems[index], [field]: value }
    setItems(newItems)
  }

  const handleCreatePO = async () => {
    if (!selectedSupplier || items.length === 0 || items.some(i => !i.productId || i.quantity <= 0)) {
      toast.error('Please fill all required fields correctly')
      return
    }

    try {
      await procurementApi.createPurchaseOrder({
        supplierId: selectedSupplier,
        expectedDeliveryDate: expectedDate || undefined,
        notes,
        items
      })
      toast.success('Purchase order created successfully')
      setShowCreateModal(false)
      fetchPurchaseOrders()
      // reset form
      setItems([])
      setSelectedSupplier(0)
      setNotes('')
    } catch (error) {
      toast.error('Failed to create purchase order')
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending': return <span className="badge badge-warning">Pending</span>
      case 'PartiallyReceived': return <span className="badge badge-primary">Partially Received</span>
      case 'Completed': return <span className="badge badge-success">Completed</span>
      case 'Cancelled': return <span className="badge badge-danger">Cancelled</span>
      default: return <span className="badge badge-secondary">{status}</span>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Procurement Management</h1>
          <p className="text-gray-500 text-sm">Create and track purchase orders from suppliers</p>
        </div>
        <button 
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="h-5 w-5" />
          New Purchase Order
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card p-6 border-l-4 border-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total POs</p>
              <h3 className="text-2xl font-bold">{purchaseOrders.length}</h3>
            </div>
            <div className="p-3 bg-blue-50 rounded-xl">
              <ShoppingBag className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-yellow-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Pending Orders</p>
              <h3 className="text-2xl font-bold">
                {purchaseOrders.filter(po => po.status === 'Pending').length}
              </h3>
            </div>
            <div className="p-3 bg-yellow-50 rounded-xl">
              <Truck className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-green-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Received POs</p>
              <h3 className="text-2xl font-bold">
                {purchaseOrders.filter(po => po.status === 'Completed').length}
              </h3>
            </div>
            <div className="p-3 bg-green-50 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>
        <div className="card p-6 border-l-4 border-indigo-500 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Total Value</p>
              <h3 className="text-2xl font-bold">Tk {purchaseOrders.reduce((acc, po) => acc + po.totalAmount, 0).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-indigo-50 rounded-xl">
              <FileText className="h-6 w-6 text-indigo-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm overflow-hidden border border-gray-100">
        <div className="p-4 border-b border-gray-200 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 max-w-2xl">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search PO#, Supplier..." 
                className="input pl-10 h-10 ring-1 ring-gray-200 border-none focus:ring-2 focus:ring-primary-500 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select 
                className="input h-10 w-44 ring-1 ring-gray-200 border-none py-0 focus:ring-2 focus:ring-primary-500 transition-all text-sm"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Statuses</option>
                <option value="Pending">Pending</option>
                <option value="PartiallyReceived">Partially Received</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-200">
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Order Number</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Supplier</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Order Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Expected Date</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Amount</th>
                <th className="px-6 py-4 text-left font-semibold text-gray-900 text-sm">Status</th>
                <th className="px-6 py-4 text-right font-semibold text-gray-900 text-sm">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500 uppercase tracking-widest text-xs animate-pulse">
                    Loading Purchase Orders...
                  </td>
                </tr>
              ) : purchaseOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    No purchase orders found.
                  </td>
                </tr>
              ) : purchaseOrders.map((po) => (
                <tr key={po.id} className="hover:bg-gray-50/80 transition-colors group">
                  <td className="px-6 py-4">
                    <span className="font-bold text-primary-600 group-hover:underline cursor-pointer">#{po.orderNumber}</span>
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900">{po.supplierName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{format(new Date(po.orderDate), 'MMM dd, yyyy')}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {po.expectedDeliveryDate ? format(new Date(po.expectedDeliveryDate), 'MMM dd, yyyy') : '-'}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">Tk {po.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">{getStatusBadge(po.status)}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                       <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-all" title="View Detail">
                        <Eye className="h-5 w-5" />
                      </button>
                      {po.status !== 'Completed' && (
                        <button className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all" title="Receive Items">
                          <Package className="h-5 w-5" />
                        </button>
                      )}
                      <button className="p-2 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create PO Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] transition-all p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <ShoppingBag className="h-6 w-6 text-primary-600" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">New Purchase Order</h2>
                  <p className="text-sm text-gray-500">Draft a new order for your supplier</p>
                </div>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-900 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700 mb-1 block">Supplier <span className="text-red-500">*</span></span>
                    <select 
                      className="input w-full h-11 bg-white ring-1 ring-gray-200"
                      value={selectedSupplier}
                      onChange={(e) => setSelectedSupplier(Number(e.target.value))}
                    >
                      <option value="0">Select Supplier</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                  </label>
                  <label className="block">
                    <span className="text-sm font-semibold text-gray-700 mb-1 block">Expected Delivery Date</span>
                    <input 
                      type="date" 
                      className="input w-full h-11 bg-white ring-1 ring-gray-200"
                      value={expectedDate}
                      onChange={(e) => setExpectedDate(e.target.value)}
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-sm font-semibold text-gray-700 mb-1 block">Notes</span>
                  <textarea 
                    className="input w-full h-[108px] py-3 bg-white ring-1 ring-gray-200 resize-none"
                    placeholder="Add special instructions or notes..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                   <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Package className="h-5 w-5 text-gray-400" />
                    Order Items
                  </h3>
                  <button 
                    onClick={handleAddItem}
                    className="text-primary-600 hover:text-primary-800 text-sm font-bold flex items-center gap-1 group"
                  >
                    <PlusCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
                    Add Product
                  </button>
                </div>
                
                <div className="border border-gray-100 rounded-xl overflow-hidden bg-gray-50/20">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-100/50 text-left border-b border-gray-100">
                        <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase">Product</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase w-32">Quantity</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase w-44">Unit Price</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase w-44">Total</th>
                        <th className="px-4 py-3 text-xs font-bold text-gray-600 uppercase w-16"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {items.map((item, index) => (
                        <tr key={index} className="bg-white">
                          <td className="px-4 py-3">
                            <select 
                              className="input h-10 ring-1 ring-gray-100 text-sm"
                              value={item.productId}
                              onChange={(e) => handleItemChange(index, 'productId', Number(e.target.value))}
                            >
                              <option value="0">Select Product</option>
                              {products.map(p => <option key={p.id} value={p.id}>{p.name} {p.sku ? `(${p.sku})` : ''}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            <input 
                              type="number" 
                              min="1"
                              className="input h-10 ring-1 ring-gray-100 text-sm font-medium"
                              value={item.quantity}
                              onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-3 relative">
                            <span className="absolute left-7 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Tk</span>
                            <input 
                              type="number" 
                              className="input h-10 pl-10 ring-1 ring-gray-100 text-sm font-medium"
                              placeholder="0.00"
                              value={item.unitPrice}
                              onChange={(e) => handleItemChange(index, 'unitPrice', Number(e.target.value))}
                            />
                          </td>
                          <td className="px-4 py-3 font-bold text-gray-900 text-sm">
                            Tk {(item.quantity * item.unitPrice).toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button 
                              onClick={() => handleRemoveItem(index)}
                              className="p-1.5 text-red-100 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-400 italic">
                            No items added yet. Click "Add Product" to start.
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-gray-50/50">
                      <tr className="font-bold text-gray-900">
                        <td colSpan={3} className="px-4 py-4 text-right pr-8">Sub Total:</td>
                        <td className="px-4 py-4 text-primary-600 text-lg">
                          Tk {items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0).toLocaleString()}
                        </td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50/30 flex items-center justify-between">
              <p className="text-xs text-gray-500 max-w-sm">
                Creating this PO will notify the supplier (mocked) and create a pending record for receiving items into your inventory.
              </p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="px-6 py-2.5 font-bold text-gray-600 hover:text-gray-900 transition-colors"
                >
                  Discard
                </button>
                <button 
                  onClick={handleCreatePO}
                  className="px-8 py-2.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 shadow-lg shadow-primary-200 transition-all active:scale-95 flex items-center gap-2"
                >
                  Review & Confirm
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
