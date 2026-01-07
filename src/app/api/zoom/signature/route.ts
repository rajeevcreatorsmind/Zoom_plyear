import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingNumber, role = '1' } = body

    // USE THE SAME CREDENTIALS EVERYWHERE!
    const ZOOM_SDK_KEY = process.env.NEXT_PUBLIC_ZOOM_SDK_KEY
    const ZOOM_SDK_SECRET = process.env.NEXT_PUBLIC_ZOOM_SDK_SECRET

    console.log('🔑 Using SDK Key:', ZOOM_SDK_KEY?.substring(0, 10) + '...')
    console.log('🔒 Secret exists:', !!ZOOM_SDK_SECRET)

    if (!ZOOM_SDK_KEY || !ZOOM_SDK_SECRET) {
      return NextResponse.json({ 
        success: false, 
        error: `Missing credentials. Key: ${!!ZOOM_SDK_KEY}, Secret: ${!!ZOOM_SDK_SECRET}` 
      }, { status: 500 })
    }

    if (!meetingNumber) {
      return NextResponse.json({ 
        success: false, 
        error: 'Meeting number required' 
      }, { status: 400 })
    }

    const cleanMeetingNumber = meetingNumber.toString().trim()
    console.log('📞 Generating signature for meeting:', cleanMeetingNumber)

    // Zoom Meeting SDK 2.x JWT format
    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 7200 // 2 hours

    const payload = {
      app_key: ZOOM_SDK_KEY,  // MUST be "app_key"
      iat: iat,
      exp: exp,
      tpc: cleanMeetingNumber,
      role_type: parseInt(role) // 0 for participant, 1 for host
    }

    console.log('📝 JWT Payload:', payload)

    // Generate JWT token
    const token = jwt.sign(payload, ZOOM_SDK_SECRET, {
      algorithm: 'HS256',
      header: {
        alg: 'HS256',
        typ: 'JWT'
      }
    })

    console.log('✅ Signature generated successfully')
    console.log('📄 Token length:', token.length)

    return NextResponse.json({
      success: true,
      signature: token,
      meetingNumber: cleanMeetingNumber,
      role: parseInt(role),
      sdkKey: ZOOM_SDK_KEY.substring(0, 10) + '...' // For debugging
    })
    
  } catch (error: any) {
    console.error('❌ Signature error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Internal server error',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { status: 500 })
  }
}