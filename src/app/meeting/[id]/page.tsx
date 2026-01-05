'use client'

import { useParams, useSearchParams } from 'next/navigation'
import ZoomMeeting from '@/components/ZoomMeeting'

export default function MeetingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass') || ''
  const userName = 'Participant'

  return (
    <div className="min-h-screen bg-gray-900">
      <ZoomMeeting 
        meetingNumber={meetingId}
        password={password}
        userName={userName}
        role={0} // Participant
      />
    </div>
  )
}