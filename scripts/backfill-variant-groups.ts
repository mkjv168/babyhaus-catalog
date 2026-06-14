import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

function extractBaseName(productName: string): string {
  let baseName = productName
  baseName = baseName.replace(/\s+(XXL|XL|L|M|S)\s+\d+/gi, '')
  baseName = baseName.replace(/\s+\d+\s*(sheets|ml|g|ML|G|pcs|pieces)/gi, '')
  const variants = [
    'Green', 'Pink', 'Edamame', 'Watermelon', 'Pretzel', 'Car', 'Miffy',
    'Apple & Sweet Potato', 'Plain', 'Snoopy & Woodstick',
    'Flying Ace & Woodstick', 'Mickey & Donald'
  ]
  for (const variant of variants) {
    baseName = baseName.replace(new RegExp(`\\s+${variant.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'gi'), '')
  }
  baseName = baseName.replace(/\s+Refill$/gi, '')
  return baseName.trim()
}

function toKebabCase(str: string): string {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
}

async function backfillVariantGroups() {
  console.log('Fetching all products...')
  const products = await prisma.product.findMany({ select: { id: true, name: true } })
  console.log(`Processing ${products.length} products...`)
  const updates: Array<{ id: string; variantGroup: string }> = []
  for (const product of products) {
    const baseName = extractBaseName(product.name)
    const variantGroup = toKebabCase(baseName)
    updates.push({ id: product.id, variantGroup })
  }
  for (const update of updates) {
    await prisma.product.update({ where: { id: update.id }, data: { variantGroup: update.variantGroup } })
  }
  console.log(`Updated ${updates.length} products`)
  const groupCounts = new Map<string, number>()
  for (const update of updates) {
    groupCounts.set(update.variantGroup, (groupCounts.get(update.variantGroup) || 0) + 1)
  }
  console.log(`Created ${groupCounts.size} variant groups`)
  console.log('Multi-variant groups:')
  Array.from(groupCounts.entries())
    .filter(([_, count]) => count > 1)
    .sort((a, b) => b[1] - a[1])
    .forEach(([group, count]) => console.log(`  ${group}: ${count} variants`))
}

backfillVariantGroups()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
