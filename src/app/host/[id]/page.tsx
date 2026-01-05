'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ZoomMeeting from '@/components/ZoomMeeting'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass') || ''
  const name = searchParams.get('name') || 'Host'

  const [isStarted, setIsStarted] = useState(false)
  const [fullUrl, setFullUrl] = useState('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFullUrl(`${window.location.origin}/meeting/${meetingId}?pass=${password}`)
    }
  }, [meetingId, password])

  const startMeeting = () => setIsStarted(true)
  const endMeeting = () => {
    setIsStarted(false)
    alert('Meeting ended.')
  }

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Top Bar - Fixed */}
      <div className="fixed top-0 left-0 right-0 bg-gray-900 border-b border-gray-800 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Host Dashboard</h1>
            <p className="text-gray-400 text-sm">
              Meeting ID: <span className="font-mono text-base">{meetingId}</span>
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${isStarted ? 'bg-green-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className={`font-medium ${isStarted ? 'text-green-400' : 'text-yellow-400'}`}>
                {isStarted ? 'LIVE' : 'Ready'}
              </span>
            </div>
            {isStarted && (
              <button
                onClick={endMeeting}
                className="bg-red-600 hover:bg-red-700 px-6 py-3 rounded-xl font-semibold transition"
              >
                End Meeting
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content - Padding for fixed header */}
      <div className="pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
            {/* Main Video Area - Wider & Controlled Height */}
            <div className="xl:col-span-3">
              {isStarted ? (
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl" style={{ height: '70vh' }}>
                  <ZoomMeeting
                    meetingNumber={meetingId}
                    password={password}
                    userName={name}
                    role={1}
                  />
                </div>
              ) : (
                <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl shadow-2xl p-12 flex flex-col items-center justify-center" style={{ height: '70vh' }}>
                  <div className="w-40 h-40 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-10 shadow-2xl">
                    <span className="text-8xl">👑</span>
                  </div>
                  <h2 className="text-5xl font-bold mb-6">Ready to Host</h2>
                  <p className="text-gray-400 text-xl mb-12 text-center max-w-md">
                    Start the meeting and invite participants to join instantly in browser
                  </p>
                  <button
                    onClick={startMeeting}
                    className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 px-16 py-6 rounded-2xl font-bold text-3xl shadow-2xl transform hover:scale-105 transition duration-300"
                  >
                    ▶ Start Meeting Now
                  </button>
                </div>
              )}
            </div>

            {/* Sidebar - Wider & Better */}
            <div className="space-y-8">
              {/* Meeting Info */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-purple-400">📋</span> Meeting Details
                </h3>
                <div className="space-y-6">
                  <div>
                    <p className="text-gray-400 mb-1">Meeting ID</p>
                    <p className="text-3xl font-mono text-white">{meetingId}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Password</p>
                    <p className="text-2xl font-mono text-white">{password || 'None'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 mb-1">Host Name</p>
                    <p className="text-xl text-white">{name}</p>
                  </div>
                </div>
              </div>

              {/* Share Section */}
              <div className="bg-gray-900 rounded-2xl p-8 border border-gray-800">
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  <span className="text-blue-400">🔗</span> Invite Participants
                </h3>
                <p className="text-gray-400 mb-4">Browser Link (No App Required):</p>
                <div className="bg-gray-950 p-5 rounded-xl mb-6 border border-gray-700">
                  <code className="text-sm text-cyan-300 break-all block">
                    {fullUrl || 'Loading...'}
                  </code>
                </div>
                <button
                  onClick={() => fullUrl && navigator.clipboard.writeText(fullUrl)}
                  className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 py-4 rounded-xl font-bold text-lg mb-5 transition"
                >
                  📋 Copy Browser Link
                </button>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      const text = `Join my meeting instantly in browser:\n${fullUrl}\n\nMeeting ID: ${meetingId}\nPassword: ${password || 'None'}`
                      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                    }}
                    className="bg-green-600 hover:bg-green-700 py-4 rounded-xl font-bold transition"
                  >
                    WhatsApp
                  </button>
                  <a
                    href={`https://zoom.us/j/${meetingId}?pwd=${password}`}
                    target="_blank"
                    className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 py-4 rounded-xl font-bold text-center block transition"
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