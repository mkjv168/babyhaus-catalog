'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface Banner {
  id: string
  imageUrl: string
  linkUrl?: string | null
  title?: string | null
  subtitle?: string | null
  order: number
  active: boolean
}

interface BannerCarouselProps {
  banners: Banner[]
}

export default function BannerCarousel({ banners }: BannerCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-play effect
  useEffect(() => {
    if (banners.length <= 1) return

    intervalRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [banners.length])

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentIndex < banners.length - 1) {
      setCurrentIndex(currentIndex + 1)
    }
    if (isRightSwipe && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length)
  }

  if (!banners || banners.length === 0) return null

  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-white shadow-sm">
      {/* Banner wrapper with touch events */}
      <div
        className="relative flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {banners.map((banner) => {
          const BannerContent = (
            <div className="relative w-full flex-shrink-0">
              <img
                src={banner.imageUrl}
                alt={banner.title || 'Promotional banner'}
                className="w-full h-[200px] md:h-[320px] object-cover"
              />
              {(banner.title || banner.subtitle) && (
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/50 to-transparent">
                  {banner.title && (
                    <h3 className="text-white text-2xl md:text-3xl font-semibold mb-2">
                      {banner.title}
                    </h3>
                  )}
                  {banner.subtitle && (
                    <p className="text-white/90 text-sm md:text-base">
                      {banner.subtitle}
                    </p>
                  )}
                </div>
              )}
            </div>
          )

          return banner.linkUrl ? (
            <Link key={banner.id} href={banner.linkUrl} className="w-full flex-shrink-0">
              {BannerContent}
            </Link>
          ) : (
            <div key={banner.id} className="w-full flex-shrink-0">
              {BannerContent}
            </div>
          )
        })}
      </div>

      {/* Desktop navigation arrows */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
            aria-label="Previous banner"
          >
            <ChevronLeft className="w-5 h-5 text-gray-700" />
          </button>
          <button
            onClick={goToNext}
            className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-md transition-all"
            aria-label="Next banner"
          >
            <ChevronRight className="w-5 h-5 text-gray-700" />
          </button>
        </>
      )}

      {/* Dot indicators */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-6'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Go to banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}