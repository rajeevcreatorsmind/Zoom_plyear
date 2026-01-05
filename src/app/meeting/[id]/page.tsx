'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ZoomMeeting from '@/components/ZoomMeeting'
import { FaCopy, FaWhatsapp, FaEnvelope, FaInfoCircle, FaUser } from 'react-icons/fa'

export default function MeetingPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass') || ''
  const [userName, setUserName] = useState('Participant')
  const [showNameInput, setShowNameInput] = useState(true)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/meeting/${meetingId}?pass=${password}`
      setShareUrl(url)
      
      // Try to get saved name
      const savedName = localStorage.getItem('zoom_user_name')
      if (savedName) {
        setUserName(savedName)
        setShowNameInput(false)
      }
    }
  }, [meetingId, password])

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (userName.trim()) {
      localStorage.setItem('zoom_user_name', userName.trim())
      setShowNameInput(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy')
    }
  }

  if (!meetingId || !password) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Meeting Not Found</h1>
          <p>Invalid meeting link or missing password</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Join Meeting</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <div className="flex items-center">
              <span className="mr-2">Meeting ID:</span>
              <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">{meetingId}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Your Name:</span>
              <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">{userName}</span>
              <button
                onClick={() => setShowNameInput(true)}
                className="ml-2 text-blue-400 hover:text-blue-300"
                title="Change name"
              >
                <FaUser className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Name Input Modal */}
        {showNameInput && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 p-8 rounded-xl max-w-md w-full">
              <h2 className="text-2xl font-bold mb-4">Enter Your Name</h2>
              <form onSubmit={handleNameSubmit}>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full p-4 bg-gray-900 border border-gray-700 rounded-lg text-white mb-4"
                  placeholder="Enter your name"
                  autoFocus
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                  >
                    Join Meeting
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNameInput(false)}
                    className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-bold hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Meeting Room</h2>
                  <div className="flex items-center bg-blue-900/30 px-4 py-2 rounded-full">
                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-bold">Ready to Join</span>
                  </div>
                </div>

                {/* Zoom Meeting Component */}
                <div className="relative bg-black rounded-xl aspect-video overflow-hidden mb-6">
                  {!showNameInput && (
                    <ZoomMeeting
                      meetingNumber={meetingId}
                      password={password}
                      userName={userName}
                      role={0}
                    />
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-gray-900 p-4 rounded-lg">
                  <div className="flex items-start">
                    <FaInfoCircle className="text-blue-400 mt-1 mr-3" />
                    <div>
                      <p className="font-semibold mb-2">Meeting Instructions:</p>
                      <ul className="text-gray-400 text-sm space-y-1">
                        <li>• Allow camera and microphone permissions when prompted</li>
                        <li>• Use the controls at the bottom to mute/unmute audio/video</li>
                        <li>• For best experience, use Chrome or Firefox browser</li>
                        <li>• Ensure stable internet connection</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Meeting Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Meeting ID</p>
                  <p className="text-xl font-bold font-mono text-white">{meetingId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Password</p>
                  <p className="text-xl font-bold text-white">{password}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Your Role</p>
                  <p className="text-lg font-semibold text-blue-400">Participant</p>
                </div>
              </div>
            </div>

            {/* Share Section */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Share This Meeting</h3>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Direct Link:</p>
                <div className="flex items-center bg-gray-900 p-3 rounded">
                  <code className="flex-1 text-sm text-blue-300 truncate">
                    {shareUrl}
                  </code>
                  <button
                    onClick={() => copyToClipboard(shareUrl)}
                    className="ml-3 text-blue-400 hover:text-blue-300"
                    title="Copy link"
                  >
                    <FaCopy />
                  </button>
                </div>
                {copied && (
                  <p className="text-green-400 text-sm mt-1">Copied!</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => {
                    const text = `Join my meeting!\n\nMeeting ID: ${meetingId}\nPassword: ${password}\nJoin Link: ${shareUrl}`
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
                  }}
                  className="flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
                
                <button
                  onClick={() => {
                    const subject = 'Join My Meeting'
                    const body = `Join my meeting!\n\nMeeting ID: ${meetingId}\nPassword: ${password}\nJoin Link: ${shareUrl}`
                    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
                  }}
                  className="flex items-center justify-center bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                >
                  <FaEnvelope className="mr-2" />
                  Email
                </button>
              </div>
            </div>

            {/* Alternative Join */}
            <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700">
              <h3 className="text-xl font-bold mb-4">Alternative Join Methods</h3>
              <div className="space-y-3">
                <button
                  onClick={() => window.open(`https://zoom.us/j/${meetingId}`, '_blank')}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  Join via Zoom App
                </button>
                <button
                  onClick={() => window.open(`zoommtg://zoom.us/join?confno=${meetingId}`, '_blank')}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700"
                >
                  Open in Zoom Desktop
                </button>
                <p className="text-xs text-gray-400 text-center mt-2">
                  Requires Zoom app installed
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Troubleshooting */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Troubleshooting</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-yellow-400 font-bold mb-2">Can't hear audio?</div>
              <p className="text-gray-400 text-sm">
                Check your speaker settings and volume. Click the audio icon in controls to troubleshoot.
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-yellow-400 font-bold mb-2">Video not working?</div>
              <p className="text-gray-400 text-sm">
                Ensure camera is connected and permissions are granted. Try refreshing the page.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}