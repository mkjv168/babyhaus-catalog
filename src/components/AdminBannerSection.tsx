'use client'

import { useState } from 'react'
import { Trash2, Eye, EyeOff, ChevronUp, ChevronDown, Plus } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

interface Banner {
  id: string
  imageUrl: string
  linkUrl?: string | null
  title?: string | null
  subtitle?: string | null
  order: number
  active: boolean
}

interface AdminBannerSectionProps {
  initialBanners: Banner[]
}

export default function AdminBannerSection({ initialBanners }: AdminBannerSectionProps) {
  const [banners, setBanners] = useState(initialBanners)
  const [isAddingBanner, setIsAddingBanner] = useState(false)
  const [newBanner, setNewBanner] = useState({
    imageUrl: '',
    linkUrl: '',
    title: '',
    subtitle: '',
    order: 0,
    active: true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this banner?')) return
    
    try {
      const res = await fetch(`/api/banners/${id}`, { method: 'DELETE' })
      if (res.ok) {
        setBanners(banners.filter(b => b.id !== id))
      }
    } catch (error) {
      console.error('Error deleting banner:', error)
    }
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active })
      })
      if (res.ok) {
        setBanners(banners.map(b => b.id === id ? { ...b, active } : b))
      }
    } catch (error) {
      console.error('Error updating banner:', error)
    }
  }

  const handleOrderChange = async (id: string, newOrder: number) => {
    try {
      const res = await fetch(`/api/banners/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order: newOrder })
      })
      if (res.ok) {
        setBanners(banners.map(b => b.id === id ? { ...b, order: newOrder } : b))
      }
    } catch (error) {
      console.error('Error updating banner order:', error)
    }
  }

  const handleAddBanner = async () => {
    if (!newBanner.imageUrl) {
      alert('Please upload an image')
      return
    }

    if (banners.length >= 5) {
      alert('Maximum of 5 banners allowed')
      return
    }

    try {
      const res = await fetch('/api/banners', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newBanner)
      })
      
      if (res.ok) {
        const banner = await res.json()
        setBanners([...banners, banner])
        setIsAddingBanner(false)
        setNewBanner({
          imageUrl: '',
          linkUrl: '',
          title: '',
          subtitle: '',
          order: 0,
          active: true
        })
      }
    } catch (error) {
      console.error('Error adding banner:', error)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-[#e8e4df] p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">🎯 Promotional Banners</h2>
        {!isAddingBanner && (
          <button
            onClick={() => setIsAddingBanner(true)}
            disabled={banners.length >= 5}
            className="flex items-center gap-1 px-3 py-1.5 bg-[#d4a574] text-white text-sm font-semibold rounded-full hover:bg-[#c49464] transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            <Plus size={16} />
            Add Banner
          </button>
        )}
      </div>

      {banners.length >= 5 && (
        <p className="text-sm text-amber-600 bg-amber-50 px-3 py-2 rounded-lg mb-4">
          ⚠️ Maximum of 5 banners reached
        </p>
      )}

      {/* Add New Banner Form */}
      {isAddingBanner && (
        <div className="mb-6 p-4 bg-[#faf8f5] rounded-xl">
          <h3 className="font-semibold mb-3">Add New Banner</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-[#7a7a7a]">Banner Image *</label>
              <ImageUpload
                onImageChange={(url) => setNewBanner({ ...newBanner, imageUrl: url })}
                currentImage={newBanner.imageUrl}
              />
            </div>
            <input
              type="text"
              placeholder="Link URL (optional)"
              value={newBanner.linkUrl}
              onChange={(e) => setNewBanner({ ...newBanner, linkUrl: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Title (optional)"
              value={newBanner.title}
              onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm"
            />
            <input
              type="text"
              placeholder="Subtitle (optional)"
              value={newBanner.subtitle}
              onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
              className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm"
            />
            <input
              type="number"
              placeholder="Order (0 = first)"
              value={newBanner.order}
              onChange={(e) => setNewBanner({ ...newBanner, order: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 border border-[#e8e4df] rounded-lg text-sm"
            />
            <div className="flex gap-2">
              <button
                onClick={handleAddBanner}
                className="px-4 py-2 bg-[#d4a574] text-white text-sm font-semibold rounded-lg hover:bg-[#c49464] transition-colors"
              >
                Add Banner
              </button>
              <button
                onClick={() => setIsAddingBanner(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Banner List */}
      {banners.length === 0 ? (
        <p className="text-sm text-[#7a7a7a]">No banners yet. Add one to get started!</p>
      ) : (
        <div className="space-y-3">
          {banners
            .sort((a, b) => a.order - b.order)
            .map((banner) => (
              <div
                key={banner.id}
                className="flex items-center gap-4 p-3 bg-[#faf8f5] rounded-xl"
              >
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                  className="w-20 h-12 object-cover rounded-lg"
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{banner.title || 'Untitled Banner'}</p>
                  {banner.subtitle && (
                    <p className="text-xs text-[#7a7a7a]">{banner.subtitle}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={banner.order}
                    onChange={(e) => handleOrderChange(banner.id, parseInt(e.target.value) || 0)}
                    className="w-12 px-2 py-1 text-xs border border-[#e8e4df] rounded"
                  />
                  <button
                    onClick={() => handleToggleActive(banner.id, !banner.active)}
                    className={`p-1.5 rounded transition-colors ${
                      banner.active
                        ? 'bg-green-100 text-green-600 hover:bg-green-200'
                        : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                    }`}
                    title={banner.active ? 'Active' : 'Inactive'}
                  >
                    {banner.active ? <Eye size={16} /> : <EyeOff size={16} />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}