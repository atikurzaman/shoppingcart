import { useQuery } from '@tanstack/react-query'
import { BarChart3, DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AdminDashboard() {
  const { data: stats } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: async () => ({
      totalProducts: 156,
      lowStockProducts: 12,
      totalOrders: 89,
      pendingOrders: 5,
      todayRevenue: 45890,
      monthlyRevenue: 1256780,
      newCustomers: 23,
      recentOrders: [
        { id: 1, orderNumber: 'ORD-2024-000001', customer: 'John Doe', amount: 2450, status: 'Pending', date: '2024-03-20' },
        { id: 2, orderNumber: 'ORD-2024-000002', customer: 'Jane Smith', amount: 1890, status: 'Processing', date: '2024-03-20' },
        { id: 3, orderNumber: 'ORD-2024-000003', customer: 'Bob Wilson', amount: 3200, status: 'Delivered', date: '2024-03-19' },
      ],
      topProducts: [
        { name: 'Product A', sold: 45, revenue: 22500 },
        { name: 'Product B', sold: 38, revenue: 19000 },
        { name: 'Product C', sold: 32, revenue: 16000 },
        { name: 'Product D', sold: 28, revenue: 14000 },
        { name: 'Product E', sold: 25, revenue: 12500 },
      ]
    }),
  })

  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 5000 },
    { name: 'Thu', revenue: 4500 },
    { name: 'Fri', revenue: 6000 },
    { name: 'Sat', revenue: 5500 },
    { name: 'Sun', revenue: 4890 },
  ]

  const StatCard = ({ icon: Icon, label, value, trend, trendValue }: any) => (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-primary-100 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
            {trend === 'up' ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-2xl font-bold text-gray-900 mb-1">{value}</h3>
      <p className="text-gray-500 text-sm">{label}</p>
    </div>
  )

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Welcome back! Here's what's happening with your store.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={DollarSign}
          label="Today's Revenue"
          value={`Tk ${stats?.todayRevenue.toLocaleString()}`}
          trend="up"
          trendValue="12.5%"
        />
        <StatCard
          icon={ShoppingCart}
          label="Pending Orders"
          value={stats?.pendingOrders || 0}
          trend="down"
          trendValue="3.2%"
        />
        <StatCard
          icon={Package}
          label="Low Stock Items"
          value={stats?.lowStockProducts || 0}
        />
        <StatCard
          icon={Users}
          label="New Customers"
          value={stats?.newCustomers || 0}
          trend="up"
          trendValue="8.1%"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={2} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.topProducts} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" stroke="#6b7280" />
                <YAxis dataKey="name" type="category" stroke="#6b7280" width={80} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card mt-6">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Orders</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {stats?.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.orderNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{order.customer}</td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">Tk {order.amount.toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`badge ${
                      order.status === 'Delivered' ? 'badge-success' :
                      order.status === 'Processing' ? 'badge-info' :
                      order.status === 'Pending' ? 'badge-warning' : 'badge-danger'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
