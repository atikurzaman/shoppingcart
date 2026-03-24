import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Tag as TagIcon, Edit, Trash2 } from 'lucide-react'
import api from '../../services/api'

export default function AdminTags() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: tags = [], isLoading } = useQuery({
    queryKey: ['product-tags', searchTerm],
    queryFn: async () => {
      const response = await api.get('/CatalogMetadata/tags')
      return response.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Product Tags</h1>
          <p className="text-gray-500 font-medium tracking-wide">Refine product taxonomy with custom metadata keywords.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Tag
        </button>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-black"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-black tracking-widest animate-pulse">Initializing indexing protocols...</div>
          ) : tags.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <TagIcon className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">Metadata Repository Empty</h4>
              <p className="text-gray-500 font-medium">Map your first product identifiers to improve store-wide searchability.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Tag Handle</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Slug Index</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {tags.map((tag: any) => (
                  <tr key={tag.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100/50 group-hover:bg-primary-50 group-hover:border-primary-100 transition-all">
                            <TagIcon className="w-5 h-5 text-gray-400 group-hover:text-primary-600" />
                         </div>
                         <span className="font-bold text-gray-900 tracking-tight">{tag.name}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="text-xs font-black text-gray-400 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-100/30 font-mono tracking-tighter">
                          /{tag.slug}
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
