import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/auth'

// GET all active banners (public)
export async function GET() {
  try {
    const banners = await prisma.banner.findMany({
      where: { active: true },
      orderBy: { order: 'asc' }
    })
    
    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

// POST new banner (admin only)
export async function POST(request: NextRequest) {
  try {
    await requireAdmin()
    
    const data = await request.json()
    
    // Check if we already have 5 banners
    const bannerCount = await prisma.banner.count()
    if (bannerCount >= 5) {
      return NextResponse.json(
        { error: 'Maximum of 5 banners allowed' },
        { status: 400 }
      )
    }
    
    const banner = await prisma.banner.create({
      data: {
        imageUrl: data.imageUrl,
        linkUrl: data.linkUrl || null,
        title: data.title || null,
        subtitle: data.subtitle || null,
        order: data.order || 0,
        active: data.active ?? true
      }
    })
    
    return NextResponse.json(banner)
  } catch (error) {
    console.error('Error creating banner:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}