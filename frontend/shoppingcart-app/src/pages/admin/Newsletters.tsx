import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Mail, Trash2, Send, Download } from 'lucide-react'
import api from '../../services/api'

export default function AdminNewsletters() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: subscribers = [], isLoading } = useQuery({
    queryKey: ['subscribers', searchTerm],
    queryFn: async () => {
      const response = await api.get('/Marketing/subscribers')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Newsletter Subscribers</h1>
          <p className="text-gray-500 font-medium">Manage your marketing email list and campaigns.</p>
        </div>
        <div className="flex gap-4">
          <button className="bg-gray-100 text-gray-600 px-6 py-2 rounded-xl border border-gray-200 hover:bg-gray-200 transition-colors font-bold text-sm flex items-center gap-2">
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Send className="h-4 w-4" />
            Send Bulk Email
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
        <div className="card-premium p-6 bg-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
            <Mail className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">{subscribers.length.toLocaleString()}</h2>
          <p className="text-gray-500 font-medium">Total Registered Subscribers</p>
        </div>
        <div className="card-premium p-6 bg-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 mb-4">
            <Plus className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">12</h2>
          <p className="text-gray-500 font-medium">New Subscribers This Week</p>
        </div>
        <div className="card-premium p-6 bg-white flex flex-col items-center text-center">
          <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 mb-4">
            <Send className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-1">5</h2>
          <p className="text-gray-500 font-medium">Campaigns Sent This Month</p>
        </div>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium">Loading subscribers...</div>
          ) : subscribers.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No subscribers found</h4>
              <p className="text-gray-500">Wait for your first newsletter subscription.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Email Address</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Subscription Date</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {subscribers.map((sub: any) => (
                  <tr key={sub.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center text-primary-600 font-bold group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            {sub.email.charAt(0).toUpperCase()}
                        </div>
                        <span className="font-bold text-gray-900">{sub.email}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">
                        {new Date(sub.subscribedAt).toLocaleDateString()}
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        sub.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.isActive ? 'Active' : 'Unsubscribed'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
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
