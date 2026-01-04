import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { meetingId, role = 0 } = body

    // Your Zoom JWT credentials
    const API_KEY = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || 'dFLvsjSbTa6wBaF1w6Evbw'
    const API_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET || 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb'

    const timestamp = new Date().getTime() - 30000
    const msg = Buffer.from(API_KEY + meetingId + timestamp + role).toString('base64')
    
    const hash = crypto.createHmac('sha256', API_SECRET).update(msg).digest('base64')
    const signature = Buffer.from(`${API_KEY}.${meetingId}.${timestamp}.${role}.${hash}`).toString('base64')

    return NextResponse.json({
      signature,
      apiKey: API_KEY,
      meetingId,
      role
    })
  } catch (error) {
    console.error('Signature error:', error)
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    )
  }
}