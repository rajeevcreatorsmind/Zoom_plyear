import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    if (action === 'create') {
      // Mock meeting creation response
      return NextResponse.json({
        success: true,
        message: 'Mock meeting created successfully',
        meeting_id: '123456789',
        password: '123456',
        join_url: 'https://zoom.us/j/123456789',
        start_url: 'https://zoom.us/s/123456789',
        topic: body.topic || 'Mock Meeting',
      })
    } else if (action === 'join') {
      // Mock meeting join response
      return NextResponse.json({
        success: true,
        message: 'Mock meeting found',
        meeting_id: body.meetingId || '123456789',
        join_url: 'https://zoom.us/j/123456789',
        topic: 'Mock Meeting',
      })
    }

    return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Mock API error' },
      { status: 500 }
    )
  }
}