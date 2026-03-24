import { useState } from 'react'
import { Save, Image as ImageIcon, Globe, Type, Tag, Link } from 'lucide-react'
import { cmsApi } from '../../services/cmsApi'
import { toast } from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

export default function AdminBlogWrite() {
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    shortDescription: '',
    content: '',
    categoryId: 1, // Defaulting to 1 for demo
    isPublished: true,
    metaTitle: '',
    metaDescription: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    setFormData(prev => ({ ...prev, [name]: val }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await cmsApi.createBlog({
        ...formData,
        categoryId: Number(formData.categoryId)
      })
      toast.success('Blog published successfully!')
      navigate('/admin/blogs')
    } catch (error) {
      toast.error('Failed to publish blog')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Write New Blog</h1>
          <p className="text-gray-500 text-sm mt-1">Compose marketing content, press releases, or SEO articles.</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 bg-white px-4 py-2 rounded-lg border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
            <input 
              type="checkbox" 
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
              className="rounded text-primary-600 focus:ring-primary-500 h-4 w-4"
            />
            Publish Immediately
          </label>
          <button 
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="bg-primary-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {isSubmitting ? 'Saving...' : 'Save Article'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Editor Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <div className="flex items-center gap-2 mb-4 border-b border-gray-100 pb-3">
              <Type className="h-5 w-5 text-gray-500" />
              <h2 className="text-lg font-medium text-gray-900">Content</h2>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blog Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. 10 Best Summer Outfits for 2026"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
              <textarea
                name="shortDescription"
                rows={2}
                value={formData.shortDescription}
                onChange={handleChange}
                placeholder="A brief summary of the article..."
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Article Body *</label>
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-gray-50 border-b border-gray-200 flex items-center gap-1 p-2">
                   <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"><Type className="w-4 h-4"/></button>
                   <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"><ImageIcon className="w-4 h-4"/></button>
                   <button className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded"><Link className="w-4 h-4"/></button>
                </div>
                <textarea
                  name="content"
                  required
                  rows={15}
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="Start writing your amazing article here..."
                  className="w-full px-4 py-4 focus:outline-none focus:ring-0 border-0 resize-y"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Configuration Section */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Globe className="h-5 w-5 text-gray-500" /> SEO Optimization
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL Slug *</label>
              <input
                type="text"
                name="slug"
                required
                value={formData.slug}
                onChange={handleChange}
                placeholder="e.g. 10-best-summer-outfits"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Title</label>
              <input
                type="text"
                name="metaTitle"
                value={formData.metaTitle}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Meta Description</label>
              <textarea
                name="metaDescription"
                rows={3}
                value={formData.metaDescription}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-sm resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
             <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <Tag className="h-5 w-5 text-gray-500" /> Taxonomy
            </h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              >
                <option value={1}>Fashion & Trends</option>
                <option value={2}>Updates & News</option>
                <option value={3}>Guides & Tutorials</option>
              </select>
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
             <h2 className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-gray-500" /> Featured Image
            </h2>
            <div className="h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center text-gray-500 hover:bg-gray-50 hover:border-primary-300 transition-colors cursor-pointer group">
               <ImageIcon className="h-8 w-8 mb-2 text-gray-400 group-hover:text-primary-500 transition-colors" />
               <span className="text-sm">Click to upload image</span>
               <span className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
