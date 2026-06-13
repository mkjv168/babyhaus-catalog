import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient({});

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin', 10);
  await prisma.adminUser.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  });

  const products = [
    {
      name: 'Aquaphor Lip Repair',
      brand: 'Aquaphor',
      category: 'Skincare',
      description: 'Lip care for dry and cracked lips. Gentle formula safe for babies.',
      price: 12.5,
      imageUrl: '/products/aquaphor-lip.jpg',
      sku: 'AQ-LIP-001',
      stockStatus: 'instock',
      featured: true,
    },
    {
      name: 'Aquaphor Healing Paste Baby',
      brand: 'Aquaphor',
      category: 'Skincare',
      description: 'Healing ointment for baby rash and irritated skin. Trusted by pediatricians.',
      price: 18.0,
      imageUrl: '/products/aquaphor-paste.jpg',
      sku: 'AQ-PST-002',
      stockStatus: 'instock',
      featured: true,
    },
    {
      name: 'Aquaphor Baby Wash & Shampoo',
      brand: 'Aquaphor',
      category: 'Bath',
      description: 'Gentle 2-in-1 wash and shampoo for delicate baby skin and hair.',
      price: 15.0,
      imageUrl: '/products/aquaphor-wash.jpg',
      sku: 'AQ-WSH-003',
      stockStatus: 'instock',
      featured: false,
    },
    {
      name: 'Aquaphor Baby Sensitive Lotion',
      brand: 'Aquaphor',
      category: 'Skincare',
      description: 'Sensitive skin lotion that protects and moisturizes baby skin.',
      price: 16.5,
      imageUrl: '/products/aquaphor-lotion.jpg',
      sku: 'AQ-LTN-004',
      stockStatus: 'instock',
      featured: false,
    },
    {
      name: 'Toys & Children\'s Books',
      brand: 'Various',
      category: 'Toys',
      description: 'Educational toys and children\'s books to stimulate early development.',
      price: null,
      imageUrl: '/products/toys-promo.jpg',
      sku: 'TOY-BOK-005',
      stockStatus: 'instock',
      featured: true,
    },
    {
      name: 'Bath Time Care Set',
      brand: 'Various',
      category: 'Bath',
      description: 'Complete bath time essentials for a soothing baby bathing experience.',
      price: 22.0,
      imageUrl: '/products/bath-time.jpg',
      sku: 'BTH-SET-006',
      stockStatus: 'instock',
      featured: false,
    },
    {
      name: 'Teething Relief',
      brand: 'Various',
      category: 'Oral Care',
      description: 'Easy to hold and clean teething relief products for babies.',
      price: 9.5,
      imageUrl: '/products/teething.jpg',
      sku: 'TEE-RLF-007',
      stockStatus: 'instock',
      featured: true,
    },
    {
      name: 'Cooling Gels',
      brand: 'Various',
      category: 'Skincare',
      description: 'Safe cooling gels suitable for use from newborn.',
      price: 8.0,
      imageUrl: '/products/cooling-gel.jpg',
      sku: 'SKN-GEL-008',
      stockStatus: 'instock',
      featured: false,
    },
    {
      name: 'Fridababy Triple-Angle Toothhugger',
      brand: 'Fridababy',
      category: 'Oral Care',
      description: 'Innovative 3-angle toothbrush designed to clean all sides of baby teeth.',
      price: 11.0,
      imageUrl: '/products/fridababy-toothbrush.jpg',
      sku: 'FRB-TBR-009',
      stockStatus: 'instock',
      featured: true,
    },
    {
      name: 'Easy-Hold Spoon & Fork Set',
      brand: 'Various',
      category: 'Feeding',
      description: 'Ergonomic spoon and fork set designed for babies 8 months and up.',
      price: 7.5,
      imageUrl: '/products/spoon-fork.jpg',
      sku: 'FED-SPN-010',
      stockStatus: 'instock',
      featured: false,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku! },
      update: {},
      create: product,
    });
  }

  console.log('Seed completed: Admin user + 10 products');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
