import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding upgrade products...')
  const products = [
    {
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'GeForce RTX 4090',
      specs: { vramGB: 24 },
      amazonLink: '',
      neweggLink: '',
      msrpUSD: 1599
    },
    {
      type: 'GPU',
      brand: 'NVIDIA',
      model: 'GeForce RTX 4080',
      specs: { vramGB: 16 },
      amazonLink: '',
      neweggLink: '',
      msrpUSD: 1199
    },
    {
      type: 'RAM',
      brand: 'Corsair',
      model: 'Vengeance RGB 64GB (2x32GB) DDR5',
      specs: { capacityGB: 64, type: 'DDR5', speedMHz: 6000 },
      amazonLink: '',
      neweggLink: '',
      msrpUSD: 199
    }
  ]

  for (const p of products) {
    try {
      const data = { ...p, specs: typeof p.specs === 'string' ? p.specs : JSON.stringify(p.specs) }
      await prisma.upgradeProduct.create({ data })
    } catch (e) {
      // ignore duplicates on re-run
    }
  }

  console.log('Seeding complete')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
