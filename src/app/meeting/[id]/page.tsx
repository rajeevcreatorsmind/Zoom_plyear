'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function MeetingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass')
  const [isJoined, setIsJoined] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Meeting</h1>
          <p className="text-gray-400">
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎥</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Meeting Room</h2>
            <p className="text-gray-400">Waiting to join...</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="font-bold mb-3">Meeting Info</h3>
              <p><span className="text-gray-400">ID:</span> {meetingId}</p>
              <p><span className="text-gray-400">Password:</span> {password}</p>
              <p><span className="text-gray-400">Role:</span> Participant</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="font-bold mb-3">Join Options</h3>
              <button
                onClick={() => setIsJoined(true)}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 py-3 rounded-lg font-bold mb-3"
              >
                {isJoined ? 'Joined' : 'Join Meeting'}
              </button>
              <a
                href={`https://zoom.us/j/${meetingId}`}
                target="_blank"
                className="block w-full border border-blue-600 text-blue-600 py-3 rounded-lg text-center"
              >
                Join via Zoom App
              </a>
            </div>
          </div>
          
          {isJoined && (
            <div className="bg-green-900/30 border border-green-700 rounded-lg p-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                <p>Connected to meeting</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}