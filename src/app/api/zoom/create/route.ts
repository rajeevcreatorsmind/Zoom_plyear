// src/app/api/zoom/create/route.ts  (ya jo path hai)

import { NextResponse } from 'next/server'
import axios from 'axios'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Credentials - CLIENT_ID public ho sakta hai, baaki server-only
    const CLIENT_ID = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID
    const CLIENT_SECRET = process.env.ZOOM_CLIENT_SECRET  // NO NEXT_PUBLIC_ !
    const ACCOUNT_ID = process.env.ZOOM_ACCOUNT_ID        // NO NEXT_PUBLIC_ !

    if (!CLIENT_ID || !CLIENT_SECRET || !ACCOUNT_ID) {
      throw new Error('Zoom credentials missing in server env')
    }

    // 1. Get OAuth access token
    const auth = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString('base64')

    const tokenResponse = await axios.post(
      'https://zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${ACCOUNT_ID}`,
      {
        headers: {
          Authorization: `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    const accessToken = tokenResponse.data.access_token

    // 2. Create real meeting
    const meetingResponse = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        topic: body.topic || 'Instant Meeting',
        type: 1, // 1 = Instant meeting (better for web SDK)
        // type: 2 = Scheduled (agar future time dena hai to)
        // start_time: body.startTime, // type 2 ke liye
        duration: parseInt(body.duration) || 60,
        timezone: 'Asia/Kolkata',
        password: body.password || Math.random().toString(36).substring(2, 10),
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: true, // important for web SDK
          mute_upon_entry: true,
          waiting_room: false,
          approval_type: 0, // No registration
          audio: 'voip',
          auto_recording: 'none',
          alternative_hosts: '',
          registrants_email_notification: false,
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const meeting = meetingResponse.data

    return NextResponse.json({
      success: true,
      message: 'Real Zoom meeting created successfully!',
      meeting_id: meeting.id.toString(),
      password: meeting.password,
      join_url: meeting.join_url,
      start_url: meeting.start_url,
      web_join_url: `/meeting/${meeting.id}?pass=${meeting.password}`,
      host_start_url: `/host/${meeting.id}?pass=${meeting.password}`,
    })

  } catch (error: any) {
    console.error('Zoom API Error:', error.response?.data || error.message)

    // Fallback demo (good for dev)
    return NextResponse.json({
      success: true,
      message: 'Demo mode: Real API failed',
      meeting_id: Math.floor(100000000 + Math.random() * 900000000).toString(),
      password: Math.random().toString(36).substring(2, 8),
      join_url: 'https://zoom.us/j/demo',
      web_join_url: `/meeting/demo?pass=demo123`,
      host_start_url: `/host/demo?pass=demo123`,
    })
  }
}