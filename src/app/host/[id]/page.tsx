'use client'

import { useParams, useSearchParams } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import ZoomMeeting, { ZoomMeetingHandle } from '@/components/ZoomMeeting'
import { 
  FaCopy, FaShareAlt, FaQrcode, FaWhatsapp, FaEnvelope, 
  FaMicrophone, FaMicrophoneSlash, FaVideo, FaVideoSlash, 
  FaDesktop, FaPhoneSlash, FaSpinner, FaInfoCircle 
} from 'react-icons/fa'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass') || ''
  const userName = searchParams.get('name') || 'Host'
  
  const [meetingStarted, setMeetingStarted] = useState(false)
  const [shareUrl, setShareUrl] = useState('')
  const [copied, setCopied] = useState(false)
  const [permissionsGranted, setPermissionsGranted] = useState(false)
  const [loadingPermissions, setLoadingPermissions] = useState(false)
  const [audioEnabled, setAudioEnabled] = useState(true)
  const [videoEnabled, setVideoEnabled] = useState(true)
  const [screenSharing, setScreenSharing] = useState(false)
  const [hasCamera, setHasCamera] = useState(true)
  const [hasMicrophone, setHasMicrophone] = useState(true)
  
  const zoomMeetingRef = useRef<ZoomMeetingHandle>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/meeting/${meetingId}?pass=${password}`
      setShareUrl(url)
    }
  }, [meetingId, password])

  const requestPermissions = async () => {
    setLoadingPermissions(true);
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      const hasMicrophone = devices.some(d => d.kind === 'audioinput' && d.deviceId);
      const hasCamera = devices.some(d => d.kind === 'videoinput' && d.deviceId);
      
      if (hasMicrophone) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {}
      }
      
      if (hasCamera) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true });
          stream.getTracks().forEach(track => track.stop());
        } catch (err) {}
      }
      
      setPermissionsGranted(true);
    } catch (error) {
      setPermissionsGranted(true);
    } finally {
      setLoadingPermissions(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      alert('Failed to copy')
    }
  }

  const startMeeting = async () => {
    setPermissionsGranted(true);
    setMeetingStarted(true);
  };

  const toggleAudio = () => {
    if (zoomMeetingRef.current) {
      zoomMeetingRef.current.toggleAudio()
      setAudioEnabled(!audioEnabled)
    }
  }

  const toggleVideo = () => {
    if (zoomMeetingRef.current) {
      zoomMeetingRef.current.toggleVideo()
      setVideoEnabled(!videoEnabled)
    }
  }

  const startScreenShare = async () => {
    if (!zoomMeetingRef.current) return
    
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      })
      
      window.ZoomMtg.startShareScreen()
      setScreenSharing(true)
      
      screenStream.getVideoTracks()[0].addEventListener('ended', () => {
        stopScreenShare()
      })
      
    } catch (error) {
      alert('Failed to start screen sharing')
    }
  }

  const stopScreenShare = () => {
    if (zoomMeetingRef.current && screenSharing) {
      window.ZoomMtg.stopShareScreen()
      setScreenSharing(false)
    }
  }

  const endMeeting = () => {
    if (zoomMeetingRef.current) {
      zoomMeetingRef.current.leaveMeeting()
      setMeetingStarted(false)
      setAudioEnabled(true)
      setVideoEnabled(true)
      setScreenSharing(false)
    }
  }

  const shareViaWhatsApp = () => {
    const text = `Join my Zoom meeting!\n\nMeeting ID: ${meetingId}\nPassword: ${password}\nJoin Link: ${shareUrl}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
  }

  const shareViaEmail = () => {
    const subject = 'Zoom Meeting Invitation'
    const body = `You're invited to join a Zoom meeting.\n\nMeeting Details:\nID: ${meetingId}\nPassword: ${password}\n\nJoin Link: ${shareUrl}`
    window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank')
  }

  const generateQRCode = () => {
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
              <span className="mr-2">Status:</span>
              <span className={`font-semibold ${meetingStarted ? 'text-green-400' : 'text-blue-400'}`}>
                {meetingStarted ? 'Live' : 'Ready'}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-gray-800 rounded-xl p-6">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Meeting Room</h2>
                  <div className={`flex items-center px-4 py-2 rounded-full ${meetingStarted ? 'bg-green-900/30' : 'bg-blue-900/30'}`}>
                    <div className={`w-3 h-3 rounded-full mr-2 ${meetingStarted ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
                    <span className="font-bold">{meetingStarted ? 'Live' : 'Ready'}</span>
                  </div>
                </div>

                {!meetingStarted && (
                  <div className="mb-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">👑</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">Ready to Host</h3>
                    
                    {!permissionsGranted && (
                      <div className="mb-4 p-4 bg-yellow-900/30 rounded-lg">
                        <h4 className="font-bold text-yellow-300 mb-2 flex items-center">
                          <FaInfoCircle className="mr-2" />
                          Permissions Required
                        </h4>
                        <p className="text-yellow-200 text-sm mb-3">
                          Allow microphone and camera access for best experience
                        </p>
                        <button
                          onClick={requestPermissions}
                          disabled={loadingPermissions}
                          className="w-full px-6 py-3 bg-yellow-600 text-white rounded-lg font-bold hover:bg-yellow-700 disabled:opacity-50 transition"
                        >
                          {loadingPermissions ? (
                            <>
                              <FaSpinner className="animate-spin inline mr-2" />
                              Requesting Permissions...
                            </>
                          ) : (
                            'Allow Camera & Microphone'
                          )}
                        </button>
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-center mb-6">
                      Click below to start hosting
                    </p>

                    <button
                      onClick={startMeeting}
                      className="w-full px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:opacity-90 transition"
                    >
                      Start Meeting as Host
                    </button>
                  </div>
                )}

                <div className="relative bg-black rounded-xl aspect-video overflow-hidden mb-6">
                  {meetingStarted ? (
                    <ZoomMeeting
                      ref={zoomMeetingRef}
                      meetingNumber={meetingId}
                      password={password}
                      userName={userName}
                      role={1}
                      autoJoin={true}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center bg-gray-900">
                      <div className="text-center">
                        <div className="w-32 h-32 bg-gray-800 rounded-full flex items-center justify-center mb-6 mx-auto">
                          <span className="text-5xl">🎤</span>
                        </div>
                        <h3 className="text-xl font-bold mb-2">Meeting Not Started</h3>
                        <p className="text-gray-400">Ready to start hosting</p>
                      </div>
                    </div>
                  )}
                </div>

                {meetingStarted && (
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-center">Host Controls</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <button
                        onClick={toggleAudio}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          audioEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {audioEnabled ? (
                          <>
                            <FaMicrophone className="h-7 w-7 mb-2" />
                            <span className="text-sm">Mute Audio</span>
                          </>
                        ) : (
                          <>
                            <FaMicrophoneSlash className="h-7 w-7 mb-2" />
                            <span className="text-sm">Unmute Audio</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={toggleVideo}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          videoEnabled ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {videoEnabled ? (
                          <>
                            <FaVideo className="h-7 w-7 mb-2" />
                            <span className="text-sm">Stop Video</span>
                          </>
                        ) : (
                          <>
                            <FaVideoSlash className="h-7 w-7 mb-2" />
                            <span className="text-sm">Start Video</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={screenSharing ? stopScreenShare : startScreenShare}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          screenSharing ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <FaDesktop className="h-7 w-7 mb-2" />
                        <span className="text-sm">
                          {screenSharing ? 'Stop Share' : 'Share Screen'}
                        </span>
                      </button>

                      <button
                        onClick={endMeeting}
                        className="flex flex-col items-center justify-center p-4 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 transition"
                      >
                        <FaPhoneSlash className="h-7 w-7 mb-2" />
                        <span className="text-sm">End Meeting</span>
                      </button>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                      <div className={`p-2 rounded ${audioEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        Audio: {audioEnabled ? 'ON' : 'OFF'}
                      </div>
                      <div className={`p-2 rounded ${videoEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        Video: {videoEnabled ? 'ON' : 'OFF'}
                      </div>
                      <div className={`p-2 rounded ${screenSharing ? 'bg-yellow-900/30 text-yellow-400' : 'bg-gray-800 text-gray-400'}`}>
                        Screen: {screenSharing ? 'SHARING' : 'READY'}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
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
                  <p className="text-green-400 text-sm mt-1">✓ Copied to clipboard</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={shareViaWhatsApp}
                  className="flex items-center justify-center bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition"
                >
                  <FaWhatsapp className="mr-2" />
                  WhatsApp
                </button>
                
                <button
                  onClick={shareViaEmail}
                  className="flex items-center justify-center bg-red-600 text-white py-3 rounded-lg font-bold hover:bg-red-700 transition"
                >
                  <FaEnvelope className="mr-2" />
                  Email
                </button>

                <button
                  onClick={generateQRCode}
                  className="col-span-2 flex items-center justify-center bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700 transition"
                >
                  <FaQrcode className="mr-2" />
                  Generate QR Code
                </button>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl">
              <h3 className="text-xl font-bold mb-4">Hosting Tips</h3>
              <ul className="space-y-3 text-gray-300">
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Check audio levels before starting</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Share screen for presentations</span>
                </li>
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Mute participants if needed</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}