import axios from 'axios';

// Use environment variables
const ZOOM_API_KEY = process.env.NEXT_PUBLIC_ZOOM_CLIENT_ID || 'dFLvsjSbTa6wBaF1w6Evbw';
const ZOOM_API_SECRET = process.env.NEXT_PUBLIC_ZOOM_CLIENT_SECRET || 'nmZkj8KL0sIvo5UCPx4t09UDKvoxhsUb';
const ZOOM_ACCOUNT_ID = process.env.NEXT_PUBLIC_ZOOM_ACCOUNT_ID || 'a1GrwpkBRuuBBt4m14Hr8g';

// Generate Zoom OAuth token
async function getZoomAccessToken() {
  try {
    const auth = Buffer.from(`${ZOOM_API_KEY}:${ZOOM_API_SECRET}`).toString('base64');
    
    console.log('Getting Zoom access token...');
    
    const response = await axios.post(
      'https://zoom.us/oauth/token',
      `grant_type=account_credentials&account_id=${ZOOM_ACCOUNT_ID}`,
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    console.log('Access token received');
    return response.data.access_token;
  } catch (error: any) {
    console.error('Error getting Zoom access token:', error.response?.data || error.message);
    throw error;
  }
}

// Create a new meeting
export async function createZoomMeeting(meetingData: {
  topic: string;
  start_time?: string;
  duration: number;
  password?: string;
  settings?: any;
}) {
  try {
    console.log('Creating Zoom meeting:', meetingData);
    
    const accessToken = await getZoomAccessToken();
    
    // Format start time if provided
    let startTime = meetingData.start_time;
    if (startTime && !startTime.includes('Z')) {
      startTime = new Date(startTime).toISOString();
    }
    
    const requestData = {
      topic: meetingData.topic || 'Zoom Meeting',
      type: 2, // Scheduled meeting
      start_time: startTime || new Date().toISOString(),
      duration: meetingData.duration || 60,
      timezone: 'Asia/Kolkata',
      password: meetingData.password || generatePassword(),
      settings: {
        host_video: true,
        participant_video: true,
        join_before_host: false,
        mute_upon_entry: false,
        waiting_room: false,
        contact_email: 'host@example.com',
        contact_name: 'Host',
        ...meetingData.settings,
      },
    };

    console.log('Sending request to Zoom API...');
    
    const response = await axios.post(
      'https://api.zoom.us/v2/users/me/meetings',
      requestData,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    console.log('Meeting created successfully:', response.data.id);
    
    return {
      success: true,
      meeting: response.data,
      join_url: response.data.join_url,
      start_url: response.data.start_url,
      meeting_id: response.data.id.toString(),
      password: response.data.password,
    };
  } catch (error: any) {
    console.error('Error creating Zoom meeting:', error.response?.data || error.message);
    
    // Return mock data for development if API fails
    if (process.env.NODE_ENV === 'development') {
      console.log('Using mock data for development');
      return {
        success: true,
        meeting: {
          id: '123456789',
          topic: meetingData.topic,
          join_url: `https://zoom.us/j/123456789`,
          start_url: `https://zoom.us/s/123456789`,
          password: meetingData.password || '123456',
        },
        join_url: `https://zoom.us/j/123456789`,
        start_url: `https://zoom.us/s/123456789`,
        meeting_id: '123456789',
        password: meetingData.password || '123456',
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Failed to create meeting',
    };
  }
}

// Get meeting details
export async function getZoomMeeting(meetingId: string) {
  try {
    console.log('Getting Zoom meeting:', meetingId);
    
    const accessToken = await getZoomAccessToken();
    
    const response = await axios.get(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    console.log('Meeting details retrieved');
    
    return {
      success: true,
      meeting: response.data,
    };
  } catch (error: any) {
    console.error('Error getting Zoom meeting:', error.response?.data || error.message);
    
    // Return mock data for development
    if (process.env.NODE_ENV === 'development') {
      return {
        success: true,
        meeting: {
          id: meetingId,
          topic: 'Sample Meeting',
          join_url: `https://zoom.us/j/${meetingId}`,
          start_url: `https://zoom.us/s/${meetingId}`,
          password: 'sample123',
        },
      };
    }
    
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Meeting not found',
    };
  }
}

// Generate random password
function generatePassword(length: number = 6): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// List all meetings
export async function listZoomMeetings() {
  try {
    const accessToken = await getZoomAccessToken();
    
    const response = await axios.get(
      'https://api.zoom.us/v2/users/me/meetings',
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        params: {
          type: 'scheduled',
          page_size: 30,
        },
      }
    );

    return {
      success: true,
      meetings: response.data.meetings || [],
    };
  } catch (error: any) {
    console.error('Error listing meetings:', error);
    return {
      success: false,
      error: error.message,
      meetings: [],
    };
  }
}

// Delete a meeting
export async function deleteZoomMeeting(meetingId: string) {
  try {
    const accessToken = await getZoomAccessToken();
    
    await axios.delete(
      `https://api.zoom.us/v2/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    return { success: true };
  } catch (error: any) {
    console.error('Error deleting meeting:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}