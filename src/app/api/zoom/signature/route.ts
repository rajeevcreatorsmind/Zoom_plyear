import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingNumber, role = '0' } = body
    
    // Use your Zoom SDK credentials
    const ZOOM_SDK_KEY = 'a1GrwpkBRuuBBt4m14Hr8g' // Client ID
    const ZOOM_SDK_SECRET = 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb' // Client Secret
    
    if (!meetingNumber) {
      return NextResponse.json({
        success: false,
        error: 'Meeting number is required'
      }, { status: 400 })
    }

    // Generate proper JWT signature
    const payload = {
      app_key: ZOOM_SDK_KEY,
      tpc: meetingNumber,
      role_type: parseInt(role),
      version: 1,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour expiration
    }

    const signature = jwt.sign(payload, ZOOM_SDK_SECRET, {
      algorithm: 'HS256',
    })

    return NextResponse.json({
      success: true,
      signature,
      sdkKey: ZOOM_SDK_KEY,
      meetingNumber,
      role
    })

  } catch (error: any) {
    console.error('Signature error:', error)
    return NextResponse.json({
      success: false,
      error: error.message || 'Failed to generate signature'
    }, { status: 500 })
  }
}