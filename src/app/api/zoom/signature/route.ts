import { NextRequest, NextResponse } from 'next/server'
import * as jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { meetingNumber, role = '0' } = body

    const ZOOM_SDK_KEY = 'a1GrwpkBRuuBBt4m14Hr8g'       // Your Meeting SDK Key
    const ZOOM_SDK_SECRET = 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb'  // Your Meeting SDK Secret

    if (!meetingNumber) {
      return NextResponse.json({ success: false, error: 'Meeting number required' }, { status: 400 })
    }

    const cleanMeetingNumber = meetingNumber.toString().trim()

    const iat = Math.floor(Date.now() / 1000)
    const exp = iat + 7200  // 2 hours

    const payload = {
      appKey: ZOOM_SDK_KEY,     // Required
      sdkKey: ZOOM_SDK_KEY,     // Some versions still expect it
      mn: cleanMeetingNumber,
      role: parseInt(role),
      iat,
      exp,
      tokenExp: exp
    }

    const signature = jwt.sign(payload, ZOOM_SDK_SECRET, { algorithm: 'HS256' })

    return NextResponse.json({
      success: true,
      signature,
      meetingNumber: cleanMeetingNumber,
      role: parseInt(role)
    })
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}