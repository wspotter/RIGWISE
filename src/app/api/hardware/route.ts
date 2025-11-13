import { NextResponse } from 'next/server'
import { prisma } from '../../../lib/prisma'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const profile = await prisma.hardwareProfile.create({ data: body })
    return NextResponse.json({ ok: true, profile })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}

export async function GET() {
  try {
    const profiles = await prisma.hardwareProfile.findMany({ orderBy: { createdAt: 'desc' } })
    return NextResponse.json({ ok: true, profiles })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
