import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, HelpCircle, MessageCircle, Clock, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import api from '../../services/api'

export default function AdminSupport() {
  const [activeStatus, setActiveStatus] = useState<string>('')
  const [searchTerm, setSearchTerm] = useState('')

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['support-tickets', activeStatus, searchTerm],
    queryFn: async () => {
      const resp = await api.get(`/Support/tickets`, { params: { status: activeStatus } })
      return resp.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Helpdesk / Support</h1>
          <p className="text-gray-500 font-medium tracking-wide">Manage customer inquiries and resolved historical cases.</p>
        </div>
        <div className="flex gap-4">
             <button className="px-6 py-2.5 bg-white text-gray-400 font-black rounded-xl text-sm border-2 border-gray-100/50 hover:bg-gray-50 transition-all flex items-center gap-2">
                <Clock className="w-4 h-4" /> Pending Archive
             </button>
             <button className="btn-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add Ticket
             </button>
        </div>
      </div>

      <div className="flex gap-4 mb-8">
         {['', 'Open', 'Pending', 'Resolved', 'Closed'].map((status) => (
            <button
                key={status}
                onClick={() => setActiveStatus(status)}
                className={`px-8 py-3 rounded-2xl font-black text-sm tracking-widest transition-all uppercase ${
                    activeStatus === status ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' : 'bg-white text-gray-400 hover:bg-gray-50'
                }`}
            >
                {status || 'All Cases'}
            </button>
         ))}
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center animate-pulse tracking-widest text-gray-400 font-black">Connecting to the global support feed...</div>
          ) : tickets.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <HelpCircle className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Helpdesk Clear</h4>
              <p className="text-gray-500 mt-2 font-medium">All customer queries have been successfully processed.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Case ID</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Customer / Subject</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Priority</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Manage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tickets.map((t: any) => (
                  <tr key={t.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                       <span className="text-xs font-black text-gray-400 uppercase bg-gray-100/50 px-2 py-1 rounded-lg">#{t.ticketNumber || t.id}</span>
                    </td>
                    <td className="px-8 py-5">
                       <div>
                          <p className="font-black text-gray-900 tracking-tight leading-none mb-1">{t.subject}</p>
                          <p className="text-xs text-gray-400 font-medium">By {t.user?.fullName || 'Guest'}</p>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${
                               t.priority === 'High' ? 'bg-red-500' : t.priority === 'Medium' ? 'bg-amber-500' : 'bg-green-500'
                           }`} />
                           <span className="text-xs font-black text-gray-900 uppercase tracking-wider">{t.priority}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border-2 ${
                           t.status === 'Open' ? 'bg-primary-50 text-primary-600 border-primary-100' : 
                           t.status === 'Resolved' ? 'bg-green-50 text-green-600 border-green-100' : 
                           'bg-gray-50 text-gray-400 border-gray-100'
                       }`}>
                           {t.status}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <button className="px-5 py-2.5 bg-[#1F2937] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-gray-200">
                          Join Discussion
                       </button>
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
