'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass')
  const [isStarted, setIsStarted] = useState(false)

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Host Dashboard</h1>
          <p className="text-gray-400">
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6 mb-6">
          <div className="text-center mb-6">
            <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">👑</span>
            </div>
            <h2 className="text-2xl font-bold mb-2">Start Meeting</h2>
            <p className="text-gray-400">You are the host of this meeting</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="font-bold mb-3">Meeting Info</h3>
              <p><span className="text-gray-400">ID:</span> {meetingId}</p>
              <p><span className="text-gray-400">Password:</span> {password}</p>
              <p><span className="text-gray-400">Role:</span> Host</p>
            </div>
            
            <div className="bg-gray-700 p-6 rounded-lg">
              <h3 className="font-bold mb-3">Quick Actions</h3>
              <button
                onClick={() => setIsStarted(true)}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg font-bold mb-3"
              >
                {isStarted ? 'Meeting Started' : 'Start Meeting'}
              </button>
              <button className="w-full border border-purple-600 text-purple-600 py-3 rounded-lg">
                Invite Participants
              </button>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-xl p-6">
          <h3 className="text-xl font-bold mb-4">Share with Participants:</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">Browser Link (No Zoom):</p>
              <div className="flex items-center bg-gray-900 p-3 rounded">
                <code className="flex-1 text-blue-300 truncate">
                  {typeof window !== 'undefined' 
                    ? `${window.location.origin}/meeting/${meetingId}?pass=${password}`
                    : 'Loading...'}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(
                    typeof window !== 'undefined' 
                      ? `${window.location.origin}/meeting/${meetingId}?pass=${password}`
                      : ''
                  )}
                  className="ml-4 text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}