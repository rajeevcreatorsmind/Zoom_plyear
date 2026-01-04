'use client'

import { useState } from 'react'
import { FaSpinner, FaVideo, FaUsers, FaCrown, FaCopy } from 'react-icons/fa'

export default function ZoomHost({ 
  meetingId, 
  password, 
  userName = 'Host' 
}: {
  meetingId: string
  password: string
  userName?: string
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [isStarted, setIsStarted] = useState(false)
  const [participantCount, setParticipantCount] = useState(0)

  const startMeeting = async () => {
    setIsStarting(true)
    
    // Simulate starting process
    setTimeout(() => {
      setIsStarting(false)
      setIsStarted(true)
      // Simulate participants joining
      const interval = setInterval(() => {
        setParticipantCount(prev => prev < 5 ? prev + 1 : prev)
      }, 2000)
      
      setTimeout(() => clearInterval(interval), 10000)
    }, 3000)
  }

  const copyParticipantLink = () => {
    const link = typeof window !== 'undefined' 
      ? `${window.location.origin}/meeting/${meetingId}?pass=${password}`
      : ''
    navigator.clipboard.writeText(link)
    alert('Participant link copied!')
  }

  return (
    <div className="bg-gray-900 text-white rounded-xl p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold flex items-center">
            <FaCrown className="mr-3 text-yellow-400" />
            Host Control Panel
          </h2>
          <p className="text-gray-400 mt-1">
            Meeting ID: <span className="font-mono text-white">{meetingId}</span>
          </p>
        </div>
        <div className="flex items-center bg-blue-900/50 px-4 py-2 rounded-lg">
          <FaUsers className="mr-2" />
          <span className="font-bold">{participantCount}</span>
          <span className="ml-2 text-gray-300">Participants</span>
        </div>
      </div>

      {!isStarted ? (
        <div className="text-center py-8">
          <div className="w-32 h-32 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaVideo className="h-16 w-16" />
          </div>
          <h3 className="text-2xl font-bold mb-4">Start Your Meeting</h3>
          <p className="text-gray-400 mb-8 max-w-md mx-auto">
            You'll host this meeting. Click below to start and share the participant link.
          </p>
          
          <button
            onClick={startMeeting}
            disabled={isStarting}
            className={`px-10 py-4 rounded-lg text-xl font-bold ${
              isStarting 
                ? 'bg-gray-700 cursor-not-allowed' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
            }`}
          >
            {isStarting ? (
              <>
                <FaSpinner className="animate-spin inline mr-3" />
                Starting Meeting...
              </>
            ) : (
              'Start Meeting as Host'
            )}
          </button>

          <div className="mt-8 p-6 bg-gray-800 rounded-xl max-w-md mx-auto">
            <h4 className="font-bold mb-3 text-lg">Share with Participants:</h4>
            <div className="flex items-center bg-gray-900 p-3 rounded mb-3">
              <code className="flex-1 text-sm truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/meeting/${meetingId}?pass=${password}` : 'Loading...'}
              </code>
              <button
                onClick={copyParticipantLink}
                className="ml-3 text-blue-400 hover:text-blue-300"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-sm text-gray-400">
              Participants can join without Zoom app using this link
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Area */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-xl aspect-video flex items-center justify-center mb-6">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaVideo className="h-10 w-10" />
                  </div>
                  <h4 className="text-xl font-bold">Meeting is Live!</h4>
                  <p className="text-gray-400">You are hosting</p>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <button className="bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700">
                  Video
                </button>
                <button className="bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700">
                  Audio
                </button>
                <button className="bg-green-600 py-3 rounded-lg font-bold hover:bg-green-700">
                  Share Screen
                </button>
                <button className="bg-red-600 py-3 rounded-lg font-bold hover:bg-red-700">
                  End Meeting
                </button>
              </div>
            </div>

            {/* Participants List */}
            <div className="bg-gray-800 p-6 rounded-xl">
              <h4 className="text-xl font-bold mb-4">Participants ({participantCount})</h4>
              <div className="space-y-3">
                {Array.from({ length: participantCount }).map((_, i) => (
                  <div key={i} className="flex items-center bg-gray-700 p-3 rounded">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                      <span className="font-bold">{String.fromCharCode(65 + i)}</span>
                    </div>
                    <div>
                      <p className="font-medium">Participant {i + 1}</p>
                      <p className="text-xs text-gray-400">Joined</p>
                    </div>
                  </div>
                ))}
                {participantCount === 0 && (
                  <p className="text-gray-400 text-center py-4">
                    Waiting for participants...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 p-6 bg-gray-800 rounded-xl">
            <h4 className="text-xl font-bold mb-4">Quick Actions</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <button
                onClick={copyParticipantLink}
                className="bg-blue-600 py-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center"
              >
                <FaCopy className="mr-3" />
                Copy Participant Link
              </button>
              <button className="bg-green-600 py-3 rounded-lg font-bold hover:bg-green-700">
                Invite More People
              </button>
              <button className="bg-purple-600 py-3 rounded-lg font-bold hover:bg-purple-700">
                Meeting Settings
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Status */}
      <div className="mt-6 text-center">
        <div className={`inline-flex items-center px-6 py-3 rounded-full ${
          isStarted ? 'bg-green-900/30 text-green-400' : 'bg-purple-900/30 text-purple-400'
        }`}>
          <div className={`w-3 h-3 rounded-full mr-3 ${
            isStarted ? 'bg-green-500 animate-pulse' : 'bg-purple-500'
          }`}></div>
          {isStarted ? 'Meeting is Live' : 'Ready to Start'}
        </div>
      </div>
    </div>
  )
}