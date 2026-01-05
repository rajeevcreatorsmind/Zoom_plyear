'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass')
  const [isStarted, setIsStarted] = useState(false)
  const [fullUrl, setFullUrl] = useState('')
  const [hasCamera, setHasCamera] = useState(false)

  useEffect(() => {
    setFullUrl(`${window.location.origin}/meeting/${meetingId}?pass=${password}`)
    
    // Check if device has camera
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setHasCamera(true))
      .catch(() => setHasCamera(false))
  }, [meetingId, password])

  const startMeeting = async () => {
    setIsStarted(true)
    
    if (hasCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: true, 
          audio: true 
        })
        // Camera available - would use stream here
        console.log('Camera access granted')
      } catch (error) {
        console.log('Camera not available, continuing without video')
      }
    }
    
    // Meeting started successfully (with or without camera)
    alert('Meeting started! Participants can now join.')
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Host Dashboard</h1>
          <p className="text-gray-400">
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Meeting Area */}
          <div className="lg:col-span-2">
            <div className="bg-black rounded-xl aspect-video overflow-hidden mb-6">
              <div className="h-full flex flex-col items-center justify-center">
                {isStarted ? (
                  <>
                    <div className="w-32 h-32 bg-gradient-to-r from-green-600 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                      <span className="text-5xl">📹</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Meeting is Live!</h2>
                    <p className="text-gray-400">
                      {hasCamera ? 'Camera is active' : 'Audio meeting only'}
                    </p>
                    <div className="mt-6 flex items-center">
                      <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                      <span className="text-green-400">Live Streaming</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
                      <span className="text-5xl">👑</span>
                    </div>
                    <h2 className="text-3xl font-bold mb-2">Ready to Start</h2>
                    <p className="text-gray-400">
                      {hasCamera ? 'Camera detected' : 'No camera - audio only'}
                    </p>
                  </>
                )}
              </div>
            </div>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={startMeeting}
                disabled={isStarted}
                className={`px-10 py-4 rounded-lg font-bold text-lg ${
                  isStarted 
                    ? 'bg-gray-700 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
                }`}
              >
                {isStarted ? '✓ Meeting Live' : '▶ Start Meeting'}
              </button>
              
              {isStarted && (
                <>
                  <button className="border border-blue-600 text-blue-600 px-8 py-4 rounded-lg font-bold">
                    Invite More
                  </button>
                  <button 
                    onClick={() => setIsStarted(false)}
                    className="border border-red-600 text-red-600 px-8 py-4 rounded-lg font-bold"
                  >
                    End Meeting
                  </button>
                </>
              )}
            </div>
          </div>
          
          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Meeting Info</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400">Meeting ID</p>
                  <p className="text-xl font-mono">{meetingId}</p>
                </div>
                <div>
                  <p className="text-gray-400">Password</p>
                  <p className="text-xl">{password}</p>
                </div>
                <div>
                  <p className="text-gray-400">Status</p>
                  <p className="text-xl">
                    {isStarted ? 
                      <span className="text-green-500 flex items-center">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                        LIVE
                      </span> : 
                      <span className="text-yellow-500">READY</span>
                    }
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-6">
              <h3 className="text-xl font-bold mb-4">Share Meeting</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 mb-2">Browser Link:</p>
                  <div className="flex items-center bg-gray-900 p-3 rounded">
                    <code className="flex-1 text-sm truncate">
                      {fullUrl || 'Loading...'}
                    </code>
                    <button
                      onClick={() => fullUrl && navigator.clipboard.writeText(fullUrl)}
                      className="ml-3 text-blue-400 hover:text-blue-300"
                    >
                      Copy
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      const text = `Join my meeting:\n${fullUrl}\n\nMeeting ID: ${meetingId}\nPassword: ${password}`
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    className="bg-green-600 py-3 rounded-lg font-bold"
                  >
                    WhatsApp
                  </button>
                  <a
                    href={`https://zoom.us/j/${meetingId}`}
                    target="_blank"
                    className="bg-blue-600 py-3 rounded-lg font-bold text-center block"
                  >
                    Zoom App
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}