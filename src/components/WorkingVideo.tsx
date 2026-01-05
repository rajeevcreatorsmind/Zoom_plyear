'use client'

import { useEffect, useState } from 'react'
import { FaVideo, FaMicrophone, FaPhoneSlash, FaUser } from 'react-icons/fa'

interface WorkingVideoProps {
  meetingId: string
  userName: string
  isHost?: boolean
}

export default function WorkingVideo({ meetingId, userName, isHost = false }: WorkingVideoProps) {
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [time, setTime] = useState('00:00')
  const [participants, setParticipants] = useState(1)

  useEffect(() => {
    // Start timer
    const startTime = Date.now()
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      setTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }, 1000)

    // Simulate participants joining
    const participantTimer = setInterval(() => {
      if (participants < 5) {
        setParticipants(p => p + 1)
      }
    }, 5000)

    return () => {
      clearInterval(timer)
      clearInterval(participantTimer)
    }
  }, [])

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-gray-900 to-black rounded-xl overflow-hidden">
      
      {/* Main video area */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="text-center max-w-lg">
          {/* Host/Participant indicator */}
          <div className="mb-6">
            <div className={`inline-flex items-center px-6 py-3 rounded-full ${isHost ? 'bg-gradient-to-r from-purple-600 to-pink-600' : 'bg-gradient-to-r from-blue-600 to-cyan-600'}`}>
              <div className="w-3 h-3 bg-white rounded-full mr-2 animate-pulse"></div>
              <span className="text-white font-bold">
                {isHost ? '🎤 Hosting Live' : '🎬 Joined Meeting'}
              </span>
            </div>
          </div>

          {/* User avatar */}
          <div className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-white/20 flex items-center justify-center bg-gradient-to-r from-blue-500 to-purple-600">
            <FaUser className="h-16 w-16 text-white" />
          </div>

          {/* User info */}
          <h3 className="text-2xl font-bold text-white mb-2">{userName}</h3>
          <p className="text-gray-300 mb-1">Meeting ID: <span className="font-mono">{meetingId}</span></p>
          <p className="text-gray-400">Duration: <span className="font-bold">{time}</span></p>
          
          {/* Participants count */}
          <div className="mt-6 inline-flex items-center bg-gray-800/50 px-4 py-2 rounded-full">
            <span className="text-white font-bold mr-2">{participants}</span>
            <span className="text-gray-300">Participants</span>
          </div>

          {/* Status message */}
          <div className="mt-6 p-4 bg-gray-800/30 rounded-lg">
            <p className="text-gray-300 text-sm">
              {isHost 
                ? 'You are the host. Participants can join using the meeting ID.'
                : 'Waiting for host to start the meeting...'}
            </p>
          </div>
        </div>
      </div>

      {/* Controls bar */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-4">
        {/* Audio control */}
        <button
          onClick={() => setAudioOn(!audioOn)}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all ${audioOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          <FaMicrophone className={`h-6 w-6 ${audioOn ? 'text-white' : 'text-white'}`} />
          <span className="text-white text-xs mt-2">{audioOn ? 'Mute' : 'Unmute'}</span>
        </button>

        {/* Video control */}
        <button
          onClick={() => setVideoOn(!videoOn)}
          className={`flex flex-col items-center p-4 rounded-2xl transition-all ${videoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          <FaVideo className={`h-6 w-6 ${videoOn ? 'text-white' : 'text-white'}`} />
          <span className="text-white text-xs mt-2">{videoOn ? 'Stop Video' : 'Start Video'}</span>
        </button>

        {/* Leave button */}
        <button className="flex flex-col items-center p-4 bg-red-600 hover:bg-red-700 rounded-2xl transition-all">
          <FaPhoneSlash className="h-6 w-6 text-white" />
          <span className="text-white text-xs mt-2">Leave</span>
        </button>
      </div>

      {/* Top info bar */}
      <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-gray-800/80 px-4 py-2 rounded-full">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span className="text-white font-medium">Connected</span>
          </div>
          <div className="text-gray-300">
            {isHost ? 'Host' : 'Participant'}
          </div>
        </div>
        
        <div className="text-gray-300 text-sm">
          Meeting in progress
        </div>
      </div>
    </div>
  )
}