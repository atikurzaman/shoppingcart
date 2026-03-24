import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Edit, Trash2, Box } from 'lucide-react'
import api from '../../services/api'

export default function AdminUnits() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: units = [], isLoading } = useQuery({
    queryKey: ['units', searchTerm],
    queryFn: async () => {
      const response = await api.get('/CatalogMetadata/units')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Units of Measure</h1>
          <p className="text-gray-500 font-medium">Manage how your product quantities are tracked.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Unit
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search units..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium">Loading units...</div>
          ) : units.length === 0 ? (
            <div className="p-20 text-center text-gray-400 font-medium">No units found. Click 'Add Unit' to create one.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Unit Name</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Short Name</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {units.map((unit: any) => (
                  <tr key={unit.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600 group-hover:bg-primary-600 group-hover:text-white transition-all">
                            <Box className="w-5 h-5" />
                        </div>
                        <span className="font-bold text-gray-900 group-hover:text-primary-600 transition-colors">{unit.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-lg tracking-wider mx-8 inline-block mt-4">{unit.shortName || unit.name.substring(0, 3).toUpperCase()}</td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        unit.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {unit.isActive ? 'Active' : 'Inactive'}
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
