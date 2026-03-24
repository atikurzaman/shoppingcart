import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, List, Edit, Trash2 } from 'lucide-react'
import api from '../../services/api'

export default function AdminAttributes() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: attributes = [], isLoading } = useQuery({
    queryKey: ['product-attributes', searchTerm],
    queryFn: async () => {
      const response = await api.get('/CatalogMetadata/attributes')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Attributes</h1>
          <p className="text-gray-500 font-medium">Define global attributes like Color, Size, or Material for product variants.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Add Attribute
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search attributes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium">Loading attributes...</div>
          ) : attributes.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <List className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No attributes found</h4>
              <p className="text-gray-500">Wait for your first attribute to be created.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Attribute Name</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Description</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Order</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {attributes.map((attr: any) => (
                  <tr key={attr.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <span className="font-bold text-gray-900">{attr.name}</span>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-gray-500">{attr.description || 'No description provided.'}</td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-black text-gray-400 bg-gray-100 px-2 py-1 rounded-lg">{attr.displayOrder || 0}</span>
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
