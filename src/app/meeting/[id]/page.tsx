'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import ZoomParticipant from '@/components/ZoomParticipant'

export default function MeetingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass')
  const userName = searchParams.get('name') || 'Participant'

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <ZoomParticipant 
          meetingId={meetingId}
          password={password || ''}
          userName={userName}
        />
      </div>
    </div>
  )
}