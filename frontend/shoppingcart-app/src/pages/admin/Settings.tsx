import { useState } from 'react'
import { Save, Globe, Lock, Share2, Mail, Layout, Terminal, Code } from 'lucide-react'

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState<'general' | 'seo' | 'social' | 'maintenance'>('general')

  return (
    <div className="max-w-[1600px] mx-auto animate-fade-up">
      <div className="flex items-center justify-between mb-8 pb-8 border-b border-gray-100">
        <div>
          <h1 className="text-4xl font-black text-gray-900 tracking-tighter leading-none mb-2 uppercase">Platform Configuration</h1>
          <p className="text-gray-500 font-medium tracking-wide">Globally synchronize site identity and technical behaviors.</p>
        </div>
        <button className="px-10 py-4 bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 hover:bg-primary-700 transition-all shadow-xl shadow-primary-100">
          <Save className="h-5 w-5" />
          Synchronize Settings
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-12">
         {/* Sidebar Navigation */}
         <div className="w-full lg:w-72 space-y-4">
            {[
                { id: 'general', icon: Globe, label: 'General Identity' },
                { id: 'seo', icon: Layout, label: 'SEO Optimization' },
                { id: 'social', icon: Share2, label: 'Social Echo' },
                { id: 'maintenance', icon: Lock, label: 'Shield / Maintenance' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${
                        activeTab === tab.id ? 'bg-[#111827] text-white shadow-2xl shadow-gray-200' : 'bg-white text-gray-400 hover:bg-gray-50 border-2 border-transparent'
                    }`}
                >
                    <tab.icon className={`w-5 h-5 ${activeTab === tab.id ? 'text-primary-500' : 'text-gray-300'}`} />
                    {tab.label}
                </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="flex-1 space-y-8">
            <div className="card-premium p-10 bg-white">
                <h2 className="text-2xl font-black text-gray-900 tracking-tighter mb-8 uppercase flex items-center gap-4">
                   <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm">
                      <Terminal className="w-5 h-5 text-gray-400" />
                   </div>
                   Core Parameter Setup
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Platform Brand Name</label>
                        <input type="text" placeholder="e.g. Shopping Cart Luxe" className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100/50 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-black text-sm tracking-widest" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Global Support Email</label>
                        <input type="email" placeholder="contact@platform.com" className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100/50 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-black text-sm tracking-widest" />
                    </div>
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Tagline</label>
                        <input type="text" placeholder="Premium Shopping Re-defined" className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100/50 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-black text-sm tracking-widest" />
                    </div>
                    <div className="space-y-3 md:col-span-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Primary Physical Location</label>
                        <textarea rows={3} placeholder="Full address details for invoices/shipping..." className="w-full px-6 py-4 bg-gray-50 border-2 border-gray-100/50 rounded-2xl focus:ring-4 focus:ring-primary-50 focus:border-primary-500 transition-all font-black text-sm tracking-widest" />
                    </div>
                </div>
            </div>

            <div className="card-premium p-10 bg-[#111827] text-white">
                <h2 className="text-xl font-black tracking-tighter mb-8 uppercase flex items-center gap-4">
                   <div className="w-10 h-10 bg-white/5 rounded-xl flex items-center justify-center border border-white/5 shadow-inner">
                      <Code className="w-5 h-5 text-primary-500" />
                   </div>
                   Security / Header Customization
                </h2>
                <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Custom Header Scripts (GTM / Analytics)</label>
                    <textarea rows={5} className="w-full px-6 py-4 bg-white/5 border-2 border-white/5 rounded-2xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 transition-all font-mono text-sm text-gray-300" placeholder="Paste <script> tags here..." />
                </div>
            </div>
         </div>
      </div>
    </div>
  )
}
