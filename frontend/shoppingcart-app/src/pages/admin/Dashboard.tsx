import { useQuery } from '@tanstack/react-query'
import { DollarSign, ShoppingCart, Package, Users, TrendingUp, TrendingDown, Clock, CheckCircle2, AlertCircle, ShoppingBag } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import api from '../../services/api'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function AdminDashboard() {
  const { data: ordersData, isLoading: isOrdersLoading } = useQuery({
    queryKey: ['dashboard-orders'],
    queryFn: async () => {
      const response = await api.get('/orders?pageIndex=0&pageSize=10')
      return response.data.data.items || []
    }
  })

  const { data: productsCount } = useQuery({
    queryKey: ['dashboard-products-count'],
    queryFn: async () => {
      const response = await api.get('/products?pageIndex=0&pageSize=1')
      return response.data.data.totalCount || 0
    }
  })

  const { data: usersCount } = useQuery({
    queryKey: ['dashboard-users-count'],
    queryFn: async () => {
      const response = await api.get('/users?pageIndex=0&pageSize=1')
      return response.data.totalCount || 0
    }
  })

  const recentOrders = ordersData || []
  
  const orderSummaryData = [
    { name: 'Pending', value: recentOrders.filter((o: any) => o.status === 'Pending').length, color: '#f59e0b' },
    { name: 'Processing', value: recentOrders.filter((o: any) => o.status === 'Processing').length, color: '#3b82f6' },
    { name: 'Delivered', value: recentOrders.filter((o: any) => o.status === 'Delivered').length, color: '#10b981' },
    { name: 'Cancelled', value: recentOrders.filter((o: any) => o.status === 'Cancelled').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  // Default values if no data
  if (orderSummaryData.length === 0) {
    orderSummaryData.push({ name: 'No Orders', value: 1, color: '#e5e7eb' });
  }

  const revenueData = [
    { name: 'Mon', revenue: 4000, orders: 12 },
    { name: 'Tue', revenue: 3000, orders: 8 },
    { name: 'Wed', revenue: 5000, orders: 15 },
    { name: 'Thu', revenue: 4500, orders: 11 },
    { name: 'Fri', revenue: 6000, orders: 18 },
    { name: 'Sat', revenue: 5500, orders: 20 },
    { name: 'Sun', revenue: 4890, orders: 14 },
  ]

  const totalSales = recentOrders.reduce((acc: number, curr: any) => acc + (curr.totalAmount || 0), 0);

  const StatCard = ({ icon: Icon, label, value, trend, trendValue, colorClass }: any) => (
    <div className="card-premium p-6 animate-fade-up">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-4 rounded-2xl ${colorClass}`}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
            {trendValue}
          </div>
        )}
      </div>
      <h3 className="text-3xl font-extrabold text-gray-900 mb-1 leading-none">{value}</h3>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
    </div>
  )

  return (
    <div className="max-w-[1600px] mx-auto">
      <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Business Insight</h1>
          <p className="text-gray-500 font-medium">Monitoring your store's performance in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 text-sm font-bold text-gray-600 flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary-500" />
            Last 30 Days
          </div>
          <button className="btn-primary !px-5 !py-2 !text-sm whitespace-nowrap">Export Report</button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Users}
          label="Total Customers"
          value={usersCount?.toLocaleString() || '0'}
          trend="up"
          trendValue="12%"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          icon={ShoppingCart}
          label="Total Orders"
          value={recentOrders.length}
          trend="up"
          trendValue="8%"
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Package}
          label="Total Products"
          value={productsCount?.toLocaleString() || '0'}
          colorClass="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={DollarSign}
          label="Total Sales"
          value={`Tk ${totalSales.toLocaleString()}`}
          trend="down"
          trendValue="3%"
          colorClass="bg-green-50 text-green-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Revenue Chart */}
        <div className="lg:col-span-2 card-premium p-8">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-gray-900">Sales Statistics</h3>
            <div className="flex gap-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-gray-400">
                <div className="w-2 h-2 rounded-full bg-primary-500" /> Revenue
              </span>
            </div>
          </div>
          <div className="h-[340px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 700, fontSize: '14px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={4} 
                  fill="url(#colorRevenue)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Order Summary Doughnut */}
        <div className="card-premium p-8 flex flex-col items-center justify-center">
          <h3 className="text-xl font-bold text-gray-900 w-full mb-8 text-center">Order Summary</h3>
          <div className="h-[300px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderSummaryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="value"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {orderSummaryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-black text-gray-900 leading-none">{recentOrders.length}</span>
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-1">Total Items</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 w-full mt-8">
            {['Pending', 'Processing', 'Delivered', 'Cancelled'].map((status) => {
              const count = recentOrders.filter((o: any) => o.status === status).length;
              const colors: Record<string, string> = {
                Pending: 'bg-yellow-500',
                Processing: 'bg-blue-500',
                Delivered: 'bg-green-500',
                Cancelled: 'bg-red-500'
              };
              return (
                <div key={status} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${colors[status] || 'bg-gray-300'}`} />
                  <span className="text-sm font-bold text-gray-600">{status} ({count})</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="card-premium overflow-hidden mb-8">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold text-gray-900">Recent Transactions</h3>
            <p className="text-sm text-gray-500 font-medium mt-1">Check the latest activities across your store.</p>
          </div>
          <button className="text-sm font-bold text-primary-600 hover:text-primary-700 underline decoration-2 underline-offset-4">View All Activities</button>
        </div>
        
        {isOrdersLoading ? (
          <div className="p-20 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-500 font-medium">Crunching data...</p>
          </div>
        ) : recentOrders.length === 0 ? (
          <div className="p-20 text-center">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-gray-300" />
            </div>
            <h4 className="text-lg font-bold text-gray-900">No transactions found</h4>
            <p className="text-gray-500">Wait for your first order to arrive!</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Order ID</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Customer</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Amount</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-left text-xs font-black text-gray-400 uppercase tracking-widest">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentOrders.map((order: any) => (
                  <tr key={order.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-600 group-hover:bg-primary-50 group-hover:text-primary-600 transition-colors">
                          <ShoppingBag className="w-5 h-5" />
                        </div>
                        <span className="text-sm font-bold text-gray-900">#{order.orderNumber}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-gray-900">{order.customerName}</span>
                        <span className="text-xs text-gray-400 font-medium">Regular Client</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-gray-900">Tk {order.totalAmount?.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                        order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                        order.status === 'Processing' ? 'bg-blue-100 text-blue-700' :
                        order.status === 'Pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-400">{new Date(order.orderDate).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
