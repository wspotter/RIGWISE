import type { PrismaClient } from '@prisma/client'

export async function recommendUpgrades(prisma: PrismaClient, analysis: any, hardware: any) {
  const recs: any[] = []
  const neededVram = Math.max(0, analysis.estimatedVramGB - hardware.vramGB)
  const neededRam = Math.max(0, analysis.estimatedRamGB - hardware.ramGB)

  // Find GPUs that have enough VRAM
  if (neededVram > 0) {
    const gpus = await prisma.upgradeProduct.findMany({ where: { type: 'GPU' } })
    const candidates = gpus
      .map((g: any) => ({ ...g, specsObj: JSON.parse(String(g.specs || '{}')) }))
      .filter((g: any) => g.specsObj.vramGB && g.specsObj.vramGB >= Math.ceil(neededVram))
    for (const c of candidates) {
      recs.push({
        type: 'GPU',
        reason: `Gives ${c.specsObj.vramGB}GB VRAM`,
        product: { id: c.id, brand: c.brand, model: c.model, amazonLink: c.amazonLink, msrpUSD: c.msrpUSD },
      })
    }
  }

  // Find RAM kits that have enough increase (capacityGB)
  if (neededRam > 0) {
    const rams = await prisma.upgradeProduct.findMany({ where: { type: 'RAM' } })
    const candidates = rams
      .map((r: any) => ({ ...r, specsObj: JSON.parse(String(r.specs || '{}')) }))
      .filter((r: any) => r.specsObj.capacityGB && r.specsObj.capacityGB >= Math.ceil(neededRam))
    for (const c of candidates) {
      recs.push({
        type: 'RAM',
        reason: `Provides ${c.specsObj.capacityGB}GB RAM`,
        product: { id: c.id, brand: c.brand, model: c.model, amazonLink: c.amazonLink, msrpUSD: c.msrpUSD },
      })
    }
  }

  return recs
}
