import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingNumber, role = '1' } = body

    const ZOOM_SDK_KEY = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY
    const ZOOM_SDK_SECRET = process.env.NEXT_PUBLIC_ZOOM_SDK_SECRET

    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing credentials' 
      }, { status: 500 })
    }

    if (!meetingNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Meeting number required' 
      }, { status: 400 })
    }

    const cleanMeetingNumber = meetingNumber.toString().trim()

    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 7200

    const payload = {
      app_key: ZOOM_SDK_KEY,
      iat: iat,
      exp: exp,
      tpc: cleanMeetingNumber,
      role_type: parseInt(role)
    }

    const token = jwt.sign(payload, ZOOM_SDK_SECRET, {
      algorithm: 'HS256',
      header: { alg: 'HS256', typ: 'JWT' }
    })

    return NextResponse.json({
      success: true,
      signature: token,
      meetingNumber: cleanMeetingNumber,
      role: parseInt(role),
      sdkKey: ZOOM_SDK_KEY
    })
    
  } catch (error: any) {
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error'
    }, { status: 500 })
  }
}