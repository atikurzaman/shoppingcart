import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Users, Shield, Edit, Trash2, Mail, CheckCircle2, UserX } from 'lucide-react'
import api from '../../services/api'

export default function AdminUsers() {
  const [searchTerm, setSearchTerm] = useState('')

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin-users', searchTerm],
    queryFn: async () => {
      const resp = await api.get('/Users')
      return resp.data.data || []
    }
  })

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight leading-none mb-2">Registered Users / Roles</h1>
          <p className="text-gray-500 font-medium tracking-wide leading-tight">Manage your community and assigned staff permissions.</p>
        </div>
        <div className="flex gap-4">
             <button className="px-6 py-2.5 bg-white text-gray-400 font-black rounded-xl text-sm border-2 border-gray-100/50 hover:bg-gray-50 transition-all flex items-center gap-2">
                <Shield className="w-4 h-4" /> Role Manager
             </button>
             <button className="btn-primary flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Add User
             </button>
        </div>
      </div>

      <div className="card-premium overflow-hidden bg-white">
        <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-[#FAFAFA]/50">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, Username, Email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-primary-100 transition-all text-sm font-black tracking-widest placeholder:text-gray-300"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="p-20 text-center text-gray-400 font-black tracking-widest animate-pulse">Authenticating with the security layer...</div>
          ) : users.length === 0 ? (
            <div className="p-20 text-center">
              <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-10 h-10 text-gray-300" />
              </div>
              <h4 className="text-lg font-black text-gray-900 uppercase tracking-widest">No users found</h4>
              <p className="text-gray-500 font-medium">Create your first account manually or synchronize with external auth.</p>
            </div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-[#FAFAFA]">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Global User</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Role</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-4 text-right text-xs font-black text-gray-400 uppercase tracking-widest">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-gray-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                         <div className="w-12 h-12 bg-gray-100 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg shadow-gray-100/50 group-hover:shadow-primary-100 transition-all overflow-hidden">
                            {user.profileImage ? <img src={user.profileImage} className="w-full h-full object-cover" /> : <Users className="w-6 h-6 text-gray-400 group-hover:text-primary-600" />}
                         </div>
                         <div>
                            <p className="font-black text-gray-900 tracking-tight leading-none mb-1">{user.fullName || user.userName}</p>
                            <p className="text-xs text-gray-400 font-black flex items-center gap-1 uppercase tracking-widest"><Mail className="w-3 h-3" /> {user.email}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                       <span className={`px-4 py-1.5 bg-gray-50 text-gray-500 text-[10px] font-black rounded-full uppercase tracking-widest ${
                           user.role === 'Admin' ? 'bg-indigo-50 text-indigo-600 border border-indigo-100/50' : 
                           user.role === 'Manager' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' : ''
                       }`}>
                          {user.role || 'Customer'}
                       </span>
                    </td>
                    <td className="px-8 py-5">
                       <div className="flex items-center gap-2">
                           <div className={`w-2 h-2 rounded-full ${user.isActive ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
                           <span className="text-[10px] font-black text-gray-900 uppercase tracking-widest">{user.isActive ? 'Live' : 'Banned'}</span>
                       </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all shadow-sm"><Edit className="h-5 w-5" /></button>
                        <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all shadow-sm"><UserX className="h-5 w-5" /></button>
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
