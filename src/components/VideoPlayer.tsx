'use client'

import { useState, useEffect, useRef } from 'react'
import { FaPlay, FaPause, FaVolumeUp, FaExpand } from 'react-icons/fa'

interface VideoPlayerProps {
  meetingNumber?: string
  password?: string
  userName?: string
}

export default function VideoPlayer({ 
  meetingNumber = "123456789", 
  password = "",
  userName = "Guest User" 
}: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(1)
  const videoRef = useRef<HTMLVideoElement>(null)

  // Initialize Zoom Meeting SDK (Client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const script = document.createElement('script')
      script.src = 'https://source.zoom.us/zoom-meeting-2.16.0.min.js'
      script.async = true
      document.head.appendChild(script)

      script.onload = () => {
        console.log('Zoom SDK loaded')
        // Initialize Zoom meeting here
      }

      return () => {
        document.head.removeChild(script)
      }
    }
  }, [])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume
    }
  }

  const toggleFullscreen = () => {
    if (videoRef.current?.requestFullscreen) {
      videoRef.current.requestFullscreen()
    }
  }

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Video Container */}
      <div className="relative bg-black rounded-lg overflow-hidden shadow-2xl">
        {/* Placeholder for Zoom Video */}
        <div className="aspect-video relative">
          <video
            ref={videoRef}
            className="w-full h-full"
            poster="/api/placeholder/1280/720"
          >
            <source src="/api/placeholder/video" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          
          {/* Controls Overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={togglePlay}
                  className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white"
                >
                  {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
                </button>
                <div className="flex items-center space-x-2">
                  <FaVolumeUp className="text-white" />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-24 accent-blue-500"
                  />
                </div>
              </div>
              <button
                onClick={toggleFullscreen}
                className="bg-white/20 hover:bg-white/30 p-3 rounded-full text-white"
              >
                <FaExpand size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Meeting Info */}
      <div className="mt-6 bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-2xl font-bold text-gray-900">Live Meeting</h3>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-gray-700">Meeting Information</h4>
            <p className="mt-2 text-gray-600">
              <strong>ID:</strong> {meetingNumber}<br />
              <strong>Password:</strong> {password || 'None required'}<br />
              <strong>Host:</strong> John Doe<br />
              <strong>Participants:</strong> 24
            </p>
          </div>
          <div>
            <h4 className="font-semibold text-gray-700">Controls</h4>
            <div className="mt-2 space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Join Audio
              </button>
              <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
                Raise Hand
              </button>
              <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700">
                Leave Meeting
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}