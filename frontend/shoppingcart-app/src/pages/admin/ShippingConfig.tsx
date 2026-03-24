import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Truck, MapPin, Edit, Trash2 } from 'lucide-react'
import api from '../../services/api'

export default function AdminShippingConfig() {
  const [activeTab, setActiveTab] = useState<'carriers' | 'points'>('carriers')

  const { data: carriers = [], isLoading: loadingCarriers } = useQuery({
    queryKey: ['carriers'],
    queryFn: async () => {
      const resp = await api.get('/Shipping/carriers')
      return resp.data.data || []
    }
  })

  const { data: pickupPoints = [], isLoading: loadingPoints } = useQuery({
    queryKey: ['pickup-points'],
    queryFn: async () => {
      const resp = await api.get('/Shipping/pickup-points')
      return resp.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Shipping Configuration</h1>
          <p className="text-gray-500 font-medium">Manage delivery carriers and local pickup locations.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          {activeTab === 'carriers' ? 'Add Carrier' : 'Add Pickup Point'}
        </button>
      </div>

      <div className="flex gap-4 mb-8">
        <button 
            onClick={() => setActiveTab('carriers')}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'carriers' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
            <Truck className="inline-block mr-2 w-4 h-4" /> Carriers
        </button>
        <button 
            onClick={() => setActiveTab('points')}
            className={`px-8 py-3 rounded-2xl font-black text-sm transition-all ${activeTab === 'points' ? 'bg-primary-600 text-white shadow-lg shadow-primary-200' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
        >
            <MapPin className="inline-block mr-2 w-4 h-4" /> Pickup Points
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        {activeTab === 'carriers' ? (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#FAFAFA]">
                        <tr>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Carrier</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Base Cost</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loadingCarriers ? <tr><td colSpan={4} className="p-20 text-center">Loading...</td></tr> : 
                        carriers.map((c: any) => (
                            <tr key={c.id}>
                                <td className="px-8 py-5">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center"><Truck className="w-6 h-6 text-gray-400" /></div>
                                        <span className="font-bold text-gray-900">{c.name}</span>
                                    </div>
                                </td>
                                <td className="px-8 py-5 font-bold text-gray-900">${c.baseCost}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {c.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl"><Edit className="h-5 w-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead className="bg-[#FAFAFA]">
                        <tr>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Location</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Contact</th>
                            <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                            <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                        {loadingPoints ? <tr><td colSpan={4} className="p-20 text-center">Loading...</td></tr> : 
                        pickupPoints.map((p: any) => (
                            <tr key={p.id}>
                                <td className="px-8 py-5">
                                    <p className="font-bold text-gray-900">{p.name}</p>
                                    <p className="text-xs text-gray-400 font-bold">{p.address}, {p.city}</p>
                                </td>
                                <td className="px-8 py-5 text-sm font-bold text-gray-500">{p.phone}</td>
                                <td className="px-8 py-5">
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                        p.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                    }`}>
                                        {p.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-8 py-5 text-right">
                                    <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl"><Edit className="h-5 w-5" /></button>
                                </td>
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
