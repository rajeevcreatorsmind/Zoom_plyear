import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  const { meetingNumber, role } = await request.json()

  const iat = Math.floor(Date.now() / 1000) - 30
  const exp = iat + 60 * 60 * 2 // 2 hours

  const header = { alg: 'HS256', typ: 'JWT' }

  const payload = {
    appKey: process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID,
    sdkKey: process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID,
    mn: meetingNumber,
    role: role, // 1 for host, 0 for participant
    iat,
    exp,
    tokenExp: exp
  }

  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url')
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url')

  const signature = crypto
    .createHmac('sha256', process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET!)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url')

  return NextResponse.json({ signature: `${encodedHeader}.${encodedPayload}.${signature}` })
}