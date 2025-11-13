import { NextResponse } from 'next/server'
import parseModelCard from '../../../../lib/huggingface'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { url } = body
    if (!url) return NextResponse.json({ ok: false, error: 'missing url' }, { status: 400 })
    const parsed = await parseModelCard(url)
    if (!parsed) return NextResponse.json({ ok: false, error: 'failed to parse' }, { status: 500 })
    return NextResponse.json({ ok: true, parsed })
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 })
  }
}
