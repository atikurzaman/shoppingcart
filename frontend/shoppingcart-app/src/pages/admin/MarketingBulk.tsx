import { useState } from 'react'
import { Plus, Search, Mail, Bell, Users, BarChart3, Send, Trash2, Edit } from 'lucide-react'

export default function AdminBulkEmail() {
  const [activeChannel, setActiveChannel] = useState<'email' | 'push'>('email')

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Bulk Marketing Tools</h1>
          <p className="text-gray-500 font-medium tracking-wide">Direct multi-channel communication with your customer base.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          New Campaign
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
           onClick={() => setActiveChannel('email')}
           className={`px-8 py-3 rounded-2xl font-black text-sm tracking-widest transition-all uppercase flex items-center gap-2 ${activeChannel === 'email' ? 'bg-[#111827] text-white shadow-xl shadow-gray-200' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
        >
           <Mail className="w-4 h-4" /> Bulk Email
        </button>
        <button 
           onClick={() => setActiveChannel('push')}
           className={`px-8 py-3 rounded-2xl font-black text-sm tracking-widest transition-all uppercase flex items-center gap-2 ${activeChannel === 'push' ? 'bg-[#111827] text-white shadow-xl shadow-gray-200' : 'bg-white text-gray-400 hover:bg-gray-50'}`}
        >
           <Bell className="w-4 h-4" /> Push Notifications
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
         <div className="card-premium p-8 bg-white border-b-4 border-primary-500">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center"><Users className="w-6 h-6 text-primary-600" /></div>
               <span className="text-xs font-black text-primary-600 uppercase tracking-widest">+12% vs last month</span>
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-1">2,482</h4>
            <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Active Subscribers</p>
         </div>
         <div className="card-premium p-8 bg-white border-b-4 border-indigo-500">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center"><Send className="w-6 h-6 text-indigo-600" /></div>
               <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Open rate: 84%</span>
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-1">125k</h4>
            <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Campaign reach</p>
         </div>
         <div className="card-premium p-8 bg-white border-b-4 border-emerald-500">
            <div className="flex items-center justify-between mb-4">
               <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center"><BarChart3 className="w-6 h-6 text-emerald-600" /></div>
               <span className="text-xs font-black text-emerald-600 uppercase tracking-widest">Efficiency index: 9.8</span>
            </div>
            <h4 className="text-3xl font-black text-gray-900 mb-1">92.4%</h4>
            <p className="text-gray-400 text-sm font-black uppercase tracking-widest">Delivery Success</p>
         </div>
      </div>

      <div className="card-premium overflow-hidden bg-white">
          <div className="p-8 border-b border-gray-100 bg-[#FAFAFA] flex items-center justify-between">
              <h2 className="text-lg font-black text-gray-900 uppercase tracking-tighter">Campaign History</h2>
              <div className="relative flex-1 max-w-sm ml-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-300" />
                  <input type="text" placeholder="Search campaigns..." className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-100 transition-all font-black text-sm" />
              </div>
          </div>
          <div className="overflow-x-auto">
              <table className="w-full text-left">
                  <thead className="bg-gray-50/50">
                      <tr>
                          <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Campaign / Target</th>
                          <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Channel</th>
                          <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Scheduled At</th>
                          <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                          <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                      <tr className="hover:bg-gray-50/30 transition-colors">
                          <td className="px-8 py-5">
                             <p className="font-black text-gray-900 uppercase tracking-tight">Summer Mega-Sale Launch</p>
                             <p className="text-xs text-gray-400 font-medium">Segment: All Active Users (2,400 members)</p>
                          </td>
                          <td className="px-8 py-5">
                             <span className="px-4 py-1.5 bg-sky-50 text-sky-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-sky-100">
                                Email Dispatch
                             </span>
                          </td>
                          <td className="px-8 py-5 text-sm font-black text-gray-400">June 24, 2026 - 09:00 AM</td>
                          <td className="px-8 py-5">
                             <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-full uppercase tracking-widest border border-emerald-100">
                                Sent successfully
                             </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                             <div className="flex items-center justify-end gap-2">
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><BarChart3 className="w-5 h-5" /></button>
                                <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Trash2 className="w-5 h-5" /></button>
                             </div>
                          </td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    </div>
  )
}
