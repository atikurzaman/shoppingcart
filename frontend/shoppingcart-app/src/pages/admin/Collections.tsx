import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Grid, Edit, Trash2, Image as ImageIcon } from 'lucide-react'
import api from '../../services/api'

export default function AdminCollections() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: collections = [], isLoading } = useQuery({
    queryKey: ['product-collections', searchTerm],
    queryFn: async () => {
      const response = await api.get('/CatalogMetadata/collections')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Collections</h1>
          <p className="text-gray-500 font-medium">Group products into thematic collections for shop-front display.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Collection
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search collections..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-medium"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-medium">Loading collections...</div>
          ) : collections.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Grid className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-bold text-gray-900">No collections found</h4>
              <p className="text-gray-500">Wait for your first product collection to be created.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Collection</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Products</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {collections.map((col: any) => (
                  <tr key={col.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl overflow-hidden border border-gray-100 flex items-center justify-center">
                           {col.imageUrl ? <img src={col.imageUrl} className="w-full h-full object-cover" /> : <ImageIcon className="w-6 h-6 text-gray-300" />}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{col.name}</p>
                          <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter mt-1">Slug: {col.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-sm font-black text-gray-900 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100">
                          {col.items?.length || 0} Items linked
                       </span>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                        col.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {col.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl"><Edit className="h-5 w-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl"><Trash2 className="h-5 w-5" /></button>
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
