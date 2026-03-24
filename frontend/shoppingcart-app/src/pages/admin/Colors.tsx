import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Palette, Edit, Trash2 } from 'lucide-react'
import api from '../../services/api'

export default function AdminColors() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: colors = [], isLoading } = useQuery({
    queryKey: ['product-colors', searchTerm],
    queryFn: async () => {
      const response = await api.get('/CatalogMetadata/colors')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Colors</h1>
          <p className="text-gray-500 font-medium">Manage pre-defined color constants for product variants.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Color
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search colors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium tracking-wide animate-pulse">Establishing secure connection to color repository...</div>
          ) : colors.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Palette className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 uppercase tracking-widest">No colors found</h4>
              <p className="text-gray-500 font-medium mt-2">Start your first visual set with a custom palette.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Visual Style</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">HEX Code</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {colors.map((color: any) => (
                  <tr key={color.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl border-4 border-white shadow-xl shadow-gray-200" 
                          style={{ backgroundColor: color.hexCode || '#CCCCCC' }} 
                        />
                        <span className="font-black text-gray-900 tracking-tight">{color.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-black text-gray-400 bg-gray-100 px-3 py-1.5 rounded-xl border border-gray-100/50 uppercase tracking-widest">{color.hexCode || 'N/A'}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        color.isActive ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-red-100 text-red-700 shadow-sm'
                      }`}>
                        {color.isActive ? 'Available' : 'Retired'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all"><Edit className="h-5 w-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all"><Trash2 className="h-5 w-5" /></button>
                      </div>
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
