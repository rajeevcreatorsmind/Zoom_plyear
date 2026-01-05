'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import ZoomMeeting from '@/components/ZoomMeeting'
import { FaCopy, FaUsers, FaShareAlt, FaQrcode, FaWhatsapp, FaEnvelope } from 'react-icons/fa'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass') || ''
  const userName = searchParams.get('name') || 'Host'
  const [participantCount, setParticipantCount] = useState(0)
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/meeting/${meetingId}?pass=${password}`
      setShareUrl(url)
    }
  }, [meetingId, password])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy')
    }
  }

  const startMeeting = () => {
    setMeetingStarted(true)
  }

  const shareViaWhatsApp = () => {
    const text = `Join my Zoom meeting!\n\nMeeting ID: ${meetingId}\nPassword: ${password}\nJoin Link: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = 'Zoom Meeting Invitation'
    const body = `You're invited to join a Zoom meeting.\n\nMeeting Details:\nTopic: Meeting\nID: ${meetingId}\nPassword: ${password}\n\nJoin Link: ${shareUrl}\n\nOr join manually:\nhttps://zoom.us/j/${meetingId}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const generateQRCode = () => {
    // Simple QR code generation using Google Charts API
    const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(shareUrl)}&choe=UTF-8`
    window.open(qrUrl, '_blank', 'width=300,height=300')
  }

  if (!meetingId || !password) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Invalid Meeting</h1>
          <p>Meeting ID or password missing</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Host Dashboard</h1>
          <div className="flex flex-wrap items-center gap-4 text-gray-400">
            <div className="flex items-center">
              <span className="mr-2">Meeting ID:</span>
              <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">{meetingId}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Password:</span>
              <span className="font-mono text-white bg-gray-800 px-3 py-1 rounded">{password}</span>
            </div>
            <div className="flex items-center">
              <span className="mr-2">Role:</span>
              <span className="text-green-400 font-semibold">Host</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Video Area */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold">Meeting Room</h2>
                  <div className={`flex items-center px-4 py-2 rounded-full ${meetingStarted ? 'bg-green-900/30' : 'bg-blue-900/30'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${meetingStarted ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <span className="font-bold">{meetingStarted ? 'Live' : 'Ready'}</span>
                  </div>
                </div>

                {/* Zoom Meeting Component */}
                <div className="relative bg-black rounded-xl aspect-video overflow-hidden mb-6">
                  {meetingStarted ? (
                    <ZoomMeeting
                      meetingNumber={meetingId}
                      password={password}
                      userName={userName}
                      role={1}                     
                    />
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center p-8">
                      <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-6">
                        <span className="text-4xl">👑</span>
                      </div>
                      <h3 className="text-2xl font-bold mb-3">Ready to Host</h3>
                      <p className="text-gray-400 text-center mb-6 max-w-md">
                        You are the host of this meeting. Click below to start the meeting and enable video/audio.
                      </p>
                      <button
                        onClick={startMeeting}
                        className="px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:opacity-90 transition"
                      >
                        Start Meeting as Host
                      </button>
                      <p className="text-sm text-gray-500 mt-4">
                        Participants can join before you start, but won't have video/audio until you begin
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-blue-400">{participantCount}</div>
                    <div className="text-sm text-gray-400">Participants</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">Host</div>
                    <div className="text-sm text-gray-400">You</div>
                  </div>
                  <div className="bg-gray-900 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-400">
                      {meetingStarted ? 'On' : 'Off'}
                    </div>
                    <div className="text-sm text-gray-400">Status</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Share Section */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <FaShareAlt className="mr-3" />
                Share Meeting
              </h3>
              
              <div className="mb-4">
                <p className="text-gray-400 text-sm mb-2">Participant Link:</p>
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
                  <p className="text-green-400 text-sm mt-1">Copied to clipboard!</p>
                )}
                <p className="text-xs text-gray-500 mt-2">
                  Share this link for browser join (no Zoom app needed)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700"
                >
                  <FaEnvelope className="mr-2" />
                  Email
                </button>

                <button
                  onClick={generateQRCode}
                  className="col-span-2 flex items-center justify-center bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
                >
                  <FaQrcode className="mr-2" />
                  Generate QR Code
                </button>
              </div>
            </div>

            {/* Meeting Info */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Meeting Information</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-gray-400 text-sm">Host Name</p>
                  <p className="text-lg font-semibold">{userName}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Meeting Status</p>
                  <p className={`text-lg font-semibold ${meetingStarted ? 'text-green-400' : 'text-yellow-400'}`}>
                    {meetingStarted ? 'Live Now' : 'Not Started'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Join Method</p>
                  <div className="flex space-x-2 mt-2">
                    <span className="bg-blue-900 text-blue-300 px-3 py-1 rounded text-sm">
                      Browser
                    </span>
                    <span className="bg-green-900 text-green-300 px-3 py-1 rounded text-sm">
                      Zoom App
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Host Controls */}
            {meetingStarted && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold mb-4">Host Controls</h3>
                <div className="grid grid-cols-2 gap-3">
                  <button className="bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700">
                    Mute All
                  </button>
                  <button className="bg-green-600 py-3 rounded-lg font-bold hover:bg-green-700">
                    Record
                  </button>
                  <button className="bg-purple-600 py-3 rounded-lg font-bold hover:bg-purple-700">
                    Breakout
                  </button>
                  <button className="bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700">
                    End All
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-3">
                  These controls affect all participants
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-gray-800/50 p-6 rounded-xl">
          <h3 className="text-xl font-bold mb-4">Host Instructions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-blue-400 font-bold mb-2">1. Start Meeting</div>
              <p className="text-gray-400 text-sm">
                Click "Start Meeting as Host" to begin the meeting with your video and audio.
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-blue-400 font-bold mb-2">2. Share Link</div>
              <p className="text-gray-400 text-sm">
                Share the participant link with attendees. They can join via browser or Zoom app.
              </p>
            </div>
            <div className="bg-gray-900 p-4 rounded-lg">
              <div className="text-blue-400 font-bold mb-2">3. Manage Participants</div>
              <p className="text-gray-400 text-sm">
                Use host controls to manage the meeting, mute participants, record, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}