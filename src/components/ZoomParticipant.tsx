'use client'

import { useState, useEffect } from 'react'
import { FaSpinner, FaVideo, FaVolumeUp, FaExpand, FaCopy } from 'react-icons/fa'

export default function ZoomParticipant({ 
  meetingId, 
  password, 
  userName = 'Participant' 
}: {
  meetingId: string
  password: string
  userName?: string
}) {
  const [isJoining, setIsJoining] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [meetingLink, setMeetingLink] = useState('')

  useEffect(() => {
    // Generate meeting link
    if (typeof window !== 'undefined') {
      setMeetingLink(`${window.location.origin}/meeting/${meetingId}?pass=${password}`)
    }
  }, [meetingId, password])

  const joinMeeting = async () => {
    setIsJoining(true)
    
    // Simulate joining process
    setTimeout(() => {
      setIsJoining(false)
      setIsJoined(true)
      
      // In real implementation, here you would initialize Zoom Web SDK
      // For now, we'll show a placeholder
    }, 2000)
  }

  const copyMeetingLink = () => {
    navigator.clipboard.writeText(meetingLink)
    alert('Meeting link copied to clipboard!')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4">
            <FaVideo className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Join Meeting
          </h1>
          <p className="text-gray-400">
            Meeting ID: <span className="font-mono text-white">{meetingId}</span>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Video Area */}
          <div className="lg:col-span-2">
            {/* Video Container */}
            <div className="bg-black rounded-xl aspect-video overflow-hidden mb-6">
              {!isJoined ? (
                <div className="h-full flex flex-col items-center justify-center text-white p-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6">
                    <FaVideo className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Ready to Join</h3>
                  <p className="text-gray-400 text-center">
                    Click the button below to join the meeting
                  </p>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white p-8">
                  <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mb-6">
                    <FaVideo className="h-12 w-12" />
                  </div>
                  <h3 className="text-2xl font-bold mb-3">Meeting Joined!</h3>
                  <p className="text-gray-400 text-center">
                    Connected as: <span className="text-white font-semibold">{userName}</span>
                  </p>
                  <div className="mt-6 flex space-x-4">
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center">
                      <FaVideo className="mr-2" /> Start Video
                    </button>
                    <button className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center">
                      <FaVolumeUp className="mr-2" /> Join Audio
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Join Button */}
            {!isJoined && (
              <div className="text-center">
                <button
                  onClick={joinMeeting}
                  disabled={isJoining}
                  className={`w-full max-w-md py-4 rounded-lg text-xl font-bold flex items-center justify-center ${
                    isJoining 
                      ? 'bg-gray-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:opacity-90'
                  } text-white`}
                >
                  {isJoining ? (
                    <>
                      <FaSpinner className="animate-spin mr-3" />
                      Joining Meeting...
                    </>
                  ) : (
                    'Join Meeting Now'
                  )}
                </button>
              </div>
            )}

            {/* Controls (When Joined) */}
            {isJoined && (
              <div className="bg-gray-800 p-6 rounded-xl">
                <h3 className="text-xl font-bold text-white mb-4">Meeting Controls</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <button className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">
                    <FaVideo className="h-6 w-6 mx-auto mb-2" />
                    <span>Video</span>
                  </button>
                  <button className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">
                    <FaVolumeUp className="h-6 w-6 mx-auto mb-2" />
                    <span>Audio</span>
                  </button>
                  <button className="bg-gray-700 text-white p-4 rounded-lg hover:bg-gray-600">
                    <FaExpand className="h-6 w-6 mx-auto mb-2" />
                    <span>Fullscreen</span>
                  </button>
                  <button className="bg-red-600 text-white p-4 rounded-lg hover:bg-red-700">
                    Leave
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="space-y-6">
            {/* Meeting Info */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Meeting Information</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-gray-400 text-sm">Meeting ID</p>
                  <p className="text-xl font-bold text-white font-mono">{meetingId}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Password</p>
                  <p className="text-xl font-bold text-white">{password}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Your Name</p>
                  <p className="text-xl font-bold text-white">{userName}</p>
                </div>
              </div>
            </div>

            {/* Share Info */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold text-white mb-4">Share This Meeting</h3>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">Direct Link:</p>
                <div className="flex items-center bg-gray-900 p-3 rounded">
                  <code className="flex-1 text-sm text-blue-300 truncate">
                    {meetingLink}
                  </code>
                  <button
                    onClick={copyMeetingLink}
                    className="ml-3 text-blue-400 hover:text-blue-300"
                    title="Copy link"
                  >
                    <FaCopy />
                  </button>
                </div>
                <button
                  onClick={() => {
                    const text = `Join my meeting:\n${meetingLink}\n\nMeeting ID: ${meetingId}\nPassword: ${password}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                  }}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
                >
                  Share on WhatsApp
                </button>
              </div>
            </div>

            {/* Alternative Join */}
            <div className="bg-blue-900/30 p-6 rounded-xl border border-blue-700">
              <h3 className="text-xl font-bold text-white mb-4">Alternative Join</h3>
              <p className="text-gray-300 mb-4">
                Prefer using Zoom app?
              </p>
              <button
                onClick={() => window.open(`https://zoom.us/j/${meetingId}`, '_blank')}
                className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
              >
                Join via Zoom App
              </button>
              <p className="text-xs text-gray-400 mt-3">
                Requires Zoom app installed
              </p>
            </div>
          </div>
        </div>

        {/* Status Message */}
        <div className="mt-8 text-center">
          {isJoined ? (
            <div className="inline-flex items-center bg-green-900/30 text-green-400 px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              Connected to meeting
            </div>
          ) : (
            <div className="inline-flex items-center bg-blue-900/30 text-blue-400 px-6 py-3 rounded-full">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              Ready to join
            </div>
          )}
        </div>
      </div>
    </div>
  )
}