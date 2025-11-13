import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.json({ ok: true, message: 'tRPC placeholder endpoint — set up tRPC server to handle requests' })
}
