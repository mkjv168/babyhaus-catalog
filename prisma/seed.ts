import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Clear existing
  await prisma.order.deleteMany()
  await prisma.productVariant.deleteMany()
  await prisma.productImage.deleteMany()
  await prisma.product.deleteMany()
  await prisma.banner.deleteMany()

  // Create products with variants
  const pamperNightTime = await prisma.product.create({
    data: {
      name: 'Pamper NightTime Diaper',
      brand: 'Pamper',
      category: 'Diapers',
      description: 'Soft overnight protection for your baby. Imported from USA.',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=400',
      variants: {
        create: [
          { sku: 'PP-XXL-NT-36', name: 'Size XXL - 36 pcs', price: 22, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'PP-XL-NT-42', name: 'Size XL - 42 pcs', price: 22, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'PP-L-NT-48', name: 'Size L - 48 pcs', price: 22, stockQuantity: 3, stockStatus: 'instock' },
          { sku: 'PP-M-NT-52', name: 'Size M - 52 pcs', price: 22, stockQuantity: 9, stockStatus: 'instock' },
        ]
      }
    }
  })

  const pamperDaytime = await prisma.product.create({
    data: {
      name: 'Pamper Daytime Diaper',
      brand: 'Pamper',
      category: 'Diapers',
      description: 'Breathable daytime diaper for active babies.',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=400',
      variants: {
        create: [
          { sku: 'PP-XL-DT-50', name: 'Size XL - 50 pcs', price: 22, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'PP-L-DT-52', name: 'Size L - 52 pcs', price: 22, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'PP-M-DT-62', name: 'Size M - 62 pcs', price: 22, stockQuantity: 3, stockStatus: 'instock' },
          { sku: 'PP-S-DT-70', name: 'Size S - 70 pcs', price: 22, stockQuantity: 1, stockStatus: 'instock' },
        ]
      }
    }
  })

  const wetWipes = await prisma.product.create({
    data: {
      name: 'Pamper Wet Wipes',
      brand: 'Pamper',
      category: 'Wet Wipes',
      description: 'Gentle wet wipes, 56 sheets per pack.',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
      variants: {
        create: [
          { sku: 'PP-WW-16', name: '56 Sheets', price: 4, stockQuantity: 30, stockStatus: 'instock' },
        ]
      }
    }
  })

  const edisonmama = await prisma.product.create({
    data: {
      name: 'Edisonmama Teething Babies',
      brand: 'Edisonmama',
      category: 'Oral Care',
      description: 'Safe silicone teething toys in fun shapes.',
      featured: true,
      imageUrl: 'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400',
      variants: {
        create: [
          { sku: 'EM-TB-GREEN', name: 'Green', price: 11, stockQuantity: 1, stockStatus: 'instock' },
          { sku: 'EM-TB-PINK', name: 'Pink', price: 11, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'EM-TB-EDAMAME', name: 'Edamame', price: 9, stockQuantity: 1, stockStatus: 'instock' },
          { sku: 'EM-TB-WATERMELON', name: 'Watermelon', price: 9, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'EM-TB-PRETZEL', name: 'Pretzel', price: 12, stockQuantity: 1, stockStatus: 'instock' },
        ]
      }
    }
  })

  const richellBottle = await prisma.product.create({
    data: {
      name: 'Richell Water Bottle',
      brand: 'Richell',
      category: 'Bottles',
      description: 'BPA-free water bottle for toddlers.',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?w=400',
      variants: {
        create: [
          { sku: 'RICHELL-WTB-CAR200ML', name: 'Car 200ML', price: 15, stockQuantity: 0, stockStatus: 'outofstock' },
          { sku: 'RICHELL-WTB-MIFFY', name: 'Miffy 200ML', price: 15, stockQuantity: 1, stockStatus: 'instock' },
        ]
      }
    }
  })

  const pigeonDetergent = await prisma.product.create({
    data: {
      name: 'Pigeon Laundry Detergent',
      brand: 'Pigeon',
      category: 'Cleaning',
      description: 'Gentle laundry detergent for baby clothes.',
      featured: false,
      imageUrl: 'https://images.unsplash.com/photo-1583947581924-860bda6a26df?w=400',
      variants: {
        create: [
          { sku: 'PG-LD-800ML', name: '800ml', price: 10, stockQuantity: 6, stockStatus: 'instock' },
        ]
      }
    }
  })

  // Banners
  await prisma.banner.createMany({
    data: [
      { imageUrl: 'https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?w=800', title: 'New Arrivals', subtitle: 'Premium diapers from USA', active: true, order: 0 },
      { imageUrl: 'https://images.unsplash.com/photo-1544367563-12123d8965cd?w=800', title: 'Teething Toys', subtitle: 'Safe & fun designs', active: true, order: 1 },
    ]
  })

  console.log('Seeded successfully!')
  console.log(`Products: ${await prisma.product.count()}`)
  console.log(`Variants: ${await prisma.productVariant.count()}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
