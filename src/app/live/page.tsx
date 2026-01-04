'use client'

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

function LiveContent()  {
  const searchParams = useSearchParams()
  const [meetingDetails, setMeetingDetails] = useState<any>(null)
  
  const meetingId = searchParams.get('meeting')
  const password = searchParams.get('password')
  const userName = searchParams.get('name')

  useEffect(() => {
    if (meetingId) {
      setMeetingDetails({
        meetingId,
        password,
        userName
      })
    }
  }, [meetingId, password, userName])

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Live Meeting</h1>
        
        {meetingDetails ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Video Area */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-xl aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🎥</div>
                  <p className="text-xl">Meeting Room: {meetingDetails.meetingId}</p>
                  <p className="text-gray-400 mt-2">Waiting for host to start...</p>
                </div>
              </div>
              
              <div className="mt-6 bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Meeting Controls</h3>
                <div className="flex space-x-4">
                  <button className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700">
                    Join Audio
                  </button>
                  <button className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700">
                    Start Video
                  </button>
                  <button className="bg-red-600 px-6 py-3 rounded-lg hover:bg-red-700">
                    Leave Meeting
                  </button>
                </div>
              </div>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Meeting Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-gray-400">Meeting ID</p>
                    <p className="text-xl font-mono">{meetingDetails.meetingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Password</p>
                    <p className="text-xl">{meetingDetails.password || 'None required'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Your Name</p>
                    <p className="text-xl">{meetingDetails.userName || 'Guest'}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button 
                    onClick={() => window.open(`https://zoom.us/j/${meetingDetails.meetingId}`, '_blank')}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 py-3 rounded-lg font-bold"
                  >
                    Open in Zoom App
                  </button>
                  <button className="w-full border border-blue-500 text-blue-500 py-3 rounded-lg">
                    Copy Meeting Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-xl">No meeting selected</p>
            <a href="/join" className="text-blue-400 hover:underline mt-4 inline-block">
              Go back to join page
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

export default function LivePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LiveContent />
    </Suspense>
  )
}
