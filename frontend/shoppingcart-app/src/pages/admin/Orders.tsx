import { useState, useEffect } from 'react'
import { Search, Eye, Download, ChevronLeft, ChevronRight, Package, CheckCircle, Truck, XCircle } from 'lucide-react'
import api from '../../services/api'
import toast from 'react-hot-toast'

interface Order {
  id: number
  orderNumber: string
  customerName: string
  customerEmail?: string
  status: string
  orderDate: string
  totalAmount: number
  paymentStatus: string
  itemCount: number
}

export default function AdminOrders() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [orderDetails, setOrderDetails] = useState<any>(null)

  const fetchOrders = async () => {
    setLoading(true)
    try {
      const params: any = { pageIndex, pageSize: 10 }
      if (searchTerm) params.search = searchTerm
      if (statusFilter) params.status = statusFilter

      const response = await api.get('/orders', { params })
      const data = response.data.data
      setOrders(data.items)
      setTotalPages(data.totalPages)
      setTotalCount(data.totalCount)
    } catch (error) {
      toast.error('Failed to fetch orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [pageIndex, statusFilter])

  const viewOrderDetails = async (orderId: number) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      setOrderDetails(response.data.data)
      setSelectedOrder(orders.find(o => o.id === orderId) || null)
    } catch (error) {
      toast.error('Failed to fetch order details')
    }
  }

  const updateOrderStatus = async (orderId: number, status: string) => {
    try {
      await api.put(`/orders/${orderId}/status`, { status })
      toast.success('Order status updated')
      fetchOrders()
    } catch (error) {
      toast.error('Failed to update order status')
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      Pending: 'badge-warning',
      Processing: 'badge-info',
      Confirmed: 'bg-blue-100 text-blue-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Delivered: 'badge-success',
      Cancelled: 'badge-danger',
    }
    return styles[status] || 'badge-info'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered':
        return <CheckCircle className="h-5 w-5 text-green-600" />
      case 'Shipped':
        return <Truck className="h-5 w-5 text-purple-600" />
      case 'Cancelled':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500">Manage and track customer orders</p>
        </div>
        <button className="btn-secondary flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export
        </button>
      </div>

      <div className="card">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by order number or customer..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && fetchOrders()}
                className="input pl-10"
              />
            </div>
            <select 
              className="input w-auto"
              value={statusFilter || ''}
              onChange={(e) => { 
                const value = e.target.value
                setStatusFilter(value ? value : undefined)
                setPageIndex(0)
              }}
            >
              <option value="">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Processing">Processing</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Shipped">Shipped</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-gray-900">{order.customerName}</p>
                    {order.customerEmail && (
                      <p className="text-sm text-gray-500">{order.customerEmail}</p>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.itemCount} items</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Tk {order.totalAmount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${getStatusBadge(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => viewOrderDetails(order.id)}
                        className="p-1 text-gray-400 hover:text-primary-600"
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <select 
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Confirmed">Confirmed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Showing {pageIndex * 10 + 1} to {Math.min((pageIndex + 1) * 10, totalCount)} of {totalCount} orders
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPageIndex(p => Math.max(0, p - 1))}
              disabled={pageIndex === 0}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="text-sm">
              Page {pageIndex + 1} of {totalPages}
            </span>
            <button
              onClick={() => setPageIndex(p => Math.min(totalPages - 1, p + 1))}
              disabled={pageIndex >= totalPages - 1}
              className="p-2 rounded-lg border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {selectedOrder && orderDetails && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold">Order {selectedOrder.orderNumber}</h3>
              <button 
                onClick={() => { setSelectedOrder(null); setOrderDetails(null); }}
                className="text-gray-400 hover:text-gray-600"
              >
                &times;
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(orderDetails.status)}
                    <span className={`badge ${getStatusBadge(orderDetails.status)}`}>{orderDetails.status}</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Order Date</p>
                  <p className="font-medium">{new Date(orderDetails.orderDate).toLocaleString()}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-500 mb-2">Items</p>
                <div className="space-y-2">
                  {orderDetails.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <div>
                        <p className="font-medium">{item.productName}</p>
                        <p className="text-sm text-gray-500">Qty: {item.quantity} x Tk {item.unitPrice}</p>
                      </div>
                      <p className="font-medium">Tk {item.totalPrice.toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>Tk {orderDetails.subTotal?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>Tk {orderDetails.shippingAmount?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>Tk {orderDetails.taxAmount?.toLocaleString()}</span>
                </div>
                {orderDetails.discountAmount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount</span>
                    <span>-Tk {orderDetails.discountAmount?.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                  <span>Total</span>
                  <span>Tk {orderDetails.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
