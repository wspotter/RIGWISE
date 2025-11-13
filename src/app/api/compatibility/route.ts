import { NextResponse } from 'next/server'
import { analyzeCompatibility } from '../../../lib/compatibility'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { hardware, model, contextLength = 4096, batchSize = 1 } = body

    if (!hardware || !model) {
      return NextResponse.json({ error: 'Missing hardware or model' }, { status: 400 })
    }

    const result = analyzeCompatibility(hardware, model, { contextLength, batchSize })

    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message ?? String(err) }, { status: 500 })
  }
}
