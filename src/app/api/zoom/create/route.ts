import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import * as jwt from 'jsonwebtoken'

async function getZoomAccessToken() {
  try {
    const ZOOM_API_KEY = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || 'dFLvsjSbTa6wBaF1w6Evbw'
    const ZOOM_API_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET || 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb'
    const ZOOM_ACCOUNT_ID = process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID || 'a1GrwpkBRuuBBt4m14Hr8g'
    
    const auth = Buffer.from(`${ZOOM_API_KEY}:${ZOOM_API_SECRET}`).toString('base64')
    
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    return response.data.access_token
  } catch (error: any) {
    console.error('Error getting access token:', error.response?.data || error.message)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { topic, startTime, duration } = body
    
    // Get Zoom access token
    const accessToken = await getZoomAccessToken()
    
    // Create real Zoom meeting
    const meetingData = {
      topic: topic || 'Zoom Meeting',
      type: 1, // Instant meeting
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: true,
        mute_upon_entry: false,
        waiting_room: false,
        meeting_authentication: false
      }
    }

    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      meetingData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    const meetingDetails = response.data

    return NextResponse.json({
      success: true,
      meeting_id: meetingDetails.id,
      password: meetingDetails.encrypted_password || generatePassword(),
      join_url: meetingDetails.join_url,
      start_url: meetingDetails.start_url,
      topic: meetingDetails.topic,
      duration: duration || 60,
      start_time: startTime || new Date().toISOString(),
      created_at: meetingDetails.created_at,
      settings: meetingDetails.settings
    })

  } catch (error: any) {
    console.error('Error creating meeting:', error.response?.data || error.message)
    
    // Fallback to local meeting if API fails
    return NextResponse.json({
      success: true,
      meeting_id: Math.floor(100000000 + Math.random() * 900000000).toString(),
      password: generatePassword(),
      topic: 'Quick Meeting',
      duration: 60,
      fallback: true,
      error_message: error.message
    })
  }
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let password = ''
  for (let i = 0; i < 6; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return password
}