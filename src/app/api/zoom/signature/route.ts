import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingNumber, role = '0' } = body
    
    // Use your Zoom SDK credentials
    const ZOOM_SDK_KEY = 'dFLvsjSbTa6wBaF1w6Evbw' // Replace with actual SDK key
    const ZOOM_SDK_SECRET = 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb' // Replace with actual SDK secret
    
    if (!meetingNumber) {
      return NextResponse.json({
        success: false,
        error: 'Meeting number is required'
      }, { status: 400 })
    }

    // Simple signature generation for testing
    const timestamp = new Date().getTime() - 30000
    const signature = `${ZOOM_SDK_KEY}.${meetingNumber}.${timestamp}.${role}.test_signature`

    return NextResponse.json({
      success: true,
      signature,
      sdkKey: ZOOM_SDK_KEY,
      meetingNumber,
      timestamp,
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