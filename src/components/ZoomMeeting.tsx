'use client'

import { useEffect, useState } from 'react'
import { FaSpinner, FaVideo, FaMicrophone, FaMicrophoneSlash, FaVideoSlash } from 'react-icons/fa'

declare global {
  interface Window {
    ZoomMtg: any
    React: any
    ReactDOM: any
    Redux: any
    ReduxThunk: any
    _: any
  }
}

interface ZoomMeetingProps {
  meetingNumber: string
  userName: string
  password?: string
  role?: number // 0 = participant, 1 = host
}

export default function ZoomMeeting({ 
  meetingNumber, 
  userName,
  password = '123456',
  role = 1
}: ZoomMeetingProps) {
  const [loading, setLoading] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [time, setTime] = useState('00:00')
  const [zoomReady, setZoomReady] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Timer
    const startTime = Date.now()
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000)
      const mins = Math.floor(seconds / 60)
      const secs = seconds % 60
      setTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`)
    }, 1000)

    // Load React and dependencies for Zoom SDK
    const loadZoomDependencies = () => {
      // Check if already loaded
      if (window.ZoomMtg) {
        console.log('Zoom already loaded')
        setZoomReady(true)
        setLoading(false)
        return
      }

      const dependencies = [
        { 
          id: 'react-js',
          url: 'https://unpkg.com/react@17/umd/react.production.min.js',
          check: () => typeof window.React !== 'undefined'
        },
        { 
          id: 'react-dom-js',
          url: 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js',
          check: () => typeof window.ReactDOM !== 'undefined'
        },
        { 
          id: 'redux-js',
          url: 'https://unpkg.com/redux@4/dist/redux.min.js',
          check: () => typeof window.Redux !== 'undefined'
        },
        { 
          id: 'redux-thunk-js',
          url: 'https://unpkg.com/redux-thunk@2/dist/redux-thunk.min.js',
          check: () => typeof window.ReduxThunk !== 'undefined'
        },
        { 
          id: 'lodash-js',
          url: 'https://unpkg.com/lodash@4/lodash.min.js',
          check: () => typeof window._ !== 'undefined'
        }
      ]

      let loadedCount = 0

      dependencies.forEach(dep => {
        if (dep.check()) {
          loadedCount++
          if (loadedCount === dependencies.length) {
            loadZoomSDK()
          }
          return
        }

        const script = document.createElement('script')
        script.id = dep.id
        script.src = dep.url
        script.async = false
        script.onload = () => {
          loadedCount++
          console.log(`Loaded: ${dep.id}`)
          if (loadedCount === dependencies.length) {
            loadZoomSDK()
          }
        }
        script.onerror = () => {
          console.error(`Failed to load: ${dep.id}`)
          loadedCount++
          if (loadedCount === dependencies.length) {
            loadZoomSDK()
          }
        }
        document.head.appendChild(script)
      })
    }

    const loadZoomSDK = () => {
      console.log('Loading Zoom SDK...')
      
      const script = document.createElement('script')
      script.src = 'https://source.zoom.us/zoom-meeting-2.18.0.min.js'
      script.async = true
      script.onload = () => {
        console.log('Zoom SDK loaded')
        
        // Small delay to ensure everything is ready
        setTimeout(() => {
          try {
            if (window.ZoomMtg) {
              console.log('ZoomMtg available')
              setZoomReady(true)
            }
          } catch (err) {
            console.log('Zoom init error:', err)
          }
          setLoading(false)
        }, 500)
      }
      script.onerror = () => {
        console.error('Failed to load Zoom SDK')
        setLoading(false)
      }
      
      document.head.appendChild(script)

      // Add CSS
      const link = document.createElement('link')
      link.href = 'https://source.zoom.us/2.18.0/css/bootstrap.css'
      link.rel = 'stylesheet'
      document.head.appendChild(link)

      const link2 = document.createElement('link')
      link2.href = 'https://source.zoom.us/2.18.0/css/react-select.css'
      link2.rel = 'stylesheet'
      document.head.appendChild(link2)
    }

    // Start loading
    loadZoomDependencies()

    return () => {
      clearInterval(timer)
      // Cleanup if joined
      if (isJoined && window.ZoomMtg) {
        try {
          window.ZoomMtg.leaveMeeting()
        } catch (err) {
          console.log('Leave error:', err)
        }
      }
    }
  }, [])

  // REAL JOIN FUNCTION
  const joinMeeting = async () => {
    if (!window.ZoomMtg) {
      setError('Zoom SDK not loaded')
      return
    }

    if (!meetingNumber) {
      setError('Meeting ID required')
      return
    }

    try {
      setLoading(true)
      setError('')

      // Initialize Zoom
      window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av')
      window.ZoomMtg.preLoadWasm()
      window.ZoomMtg.prepareWebSDK()

      // Get signature from your API
      const signatureResponse = await fetch('/api/zoom/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingNumber,
          role: role.toString()
        }),
      })

      const signatureData = await signatureResponse.json()
      
      if (!signatureData.success) {
        throw new Error(signatureData.error || 'Failed to get signature')
      }

      console.log('Got signature:', signatureData.signature?.substring(0, 50) + '...')

      // Zoom config
      const meetConfig = {
        sdkKey: signatureData.sdkKey,
        signature: signatureData.signature,
        meetingNumber: meetingNumber,
        userName: userName,
        passWord: password,
        leaveUrl: window.location.origin,
        role: role
      }

      console.log('Joining meeting with config:', {
        meetingNumber: meetConfig.meetingNumber,
        userName: meetConfig.userName,
        role: meetConfig.role
      })

      // Initialize
      window.ZoomMtg.init({
        leaveUrl: meetConfig.leaveUrl,
        isSupportAV: true,
        success: () => {
          console.log('Zoom init success')
          
          // Join meeting
          window.ZoomMtg.join({
            signature: meetConfig.signature,
            sdkKey: meetConfig.sdkKey,
            meetingNumber: meetConfig.meetingNumber,
            passWord: meetConfig.passWord,
            userName: meetConfig.userName,
            userEmail: '',
            tk: '',
            zak: '',
            success: () => {
              console.log('Join meeting success')
              setIsJoined(true)
              setLoading(false)
              setError('')
            },
            error: (err: any) => {
              console.error('Join error:', err)
              setError(`Join failed: ${err.message || 'Unknown error'}`)
              setLoading(false)
              setIsJoined(false)
            }
          })
        },
        error: (err: any) => {
          console.error('Init error:', err)
          setError(`Init failed: ${err.message || 'Unknown error'}`)
          setLoading(false)
          setIsJoined(false)
        }
      })

    } catch (err: any) {
      console.error('Join meeting error:', err)
      setError(err.message || 'Failed to join meeting')
      setLoading(false)
      setIsJoined(false)
    }
  }

  const toggleAudio = () => {
    if (!window.ZoomMtg || !isJoined) return
    
    try {
      if (audioOn) {
        window.ZoomMtg.muteAudio('all')
        setAudioOn(false)
      } else {
        window.ZoomMtg.unmuteAudio('all')
        setAudioOn(true)
      }
    } catch (err) {
      console.error('Toggle audio error:', err)
    }
  }

  const toggleVideo = () => {
    if (!window.ZoomMtg || !isJoined) return
    
    try {
      if (videoOn) {
        window.ZoomMtg.muteVideo()
        setVideoOn(false)
      } else {
        window.ZoomMtg.unmuteVideo()
        setVideoOn(true)
      }
    } catch (err) {
      console.error('Toggle video error:', err)
    }
  }

  const leaveMeeting = () => {
    if (window.ZoomMtg && isJoined) {
      try {
        window.ZoomMtg.leaveMeeting()
      } catch (err) {
        console.error('Leave error:', err)
      }
    }
    setIsJoined(false)
  }

  if (loading) {
    return (
      <div className="w-full h-full bg-black rounded-xl flex flex-col items-center justify-center">
        <FaSpinner className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">Loading Zoom...</p>
        <p className="text-gray-400 text-sm mt-2">Meeting ID: {meetingNumber}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
      {/* Zoom Meeting Container */}
      <div id="zmmtg-root" className="w-full h-full"></div>
      
      {/* Status Overlay */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center ${isJoined ? 'bg-transparent pointer-events-none' : 'bg-black/90'}`}>
        {!isJoined && (
          <div className="text-center p-8 rounded-xl bg-black/70">
            <div className="w-40 h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaVideo className="h-20 w-20 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userName}</h3>
            <p className="text-gray-300">Meeting ID: {meetingNumber}</p>
            <p className="text-gray-400 mt-1">Role: {role === 1 ? 'Host' : 'Participant'}</p>
            
            <div className="mt-6">
              {error && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4">
                  {error}
                </div>
              )}
              
              <div className="inline-flex items-center bg-green-900/30 px-4 py-2 rounded-full mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  {zoomReady ? 'Zoom Ready' : 'Loading...'}
                </span>
              </div>
              
              {zoomReady && (
                <button
                  onClick={joinMeeting}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90"
                >
                  {role === 1 ? 'Start Meeting as Host' : 'Join Meeting'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Controls - Only show when joined */}
      {isJoined && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full z-20">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${audioOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {audioOn ? (
              <FaMicrophone className="h-5 w-5 text-white" />
            ) : (
              <FaMicrophoneSlash className="h-5 w-5 text-white" />
            )}
          </button>
          
          <button
            onClick={toggleVideo}
            className={`p-3 rounded-full ${videoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {videoOn ? (
              <FaVideo className="h-5 w-5 text-white" />
            ) : (
              <FaVideoSlash className="h-5 w-5 text-white" />
            )}
          </button>
          
          <button
            onClick={leaveMeeting}
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700"
          >
            Leave
          </button>
        </div>
      )}

      {/* Status Badge */}
      <div className="absolute top-4 left-4 z-10">
        <div className={`flex items-center px-4 py-2 rounded-full ${isJoined ? 'bg-green-900/80' : 'bg-blue-900/80'}`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
          <span className="text-white text-sm">
            {isJoined ? 'Live' : zoomReady ? 'Ready' : 'Loading'}
          </span>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="absolute top-4 right-4 bg-red-900/80 text-white p-3 rounded-lg max-w-xs">
          <p className="text-sm">{error}</p>
          <button
            onClick={() => setError('')}
            className="text-xs underline mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  )
}