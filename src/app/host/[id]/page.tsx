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
  const [hasCamera, setHasCamera] = useState(true) // Assume true by default
  const [hasMicrophone, setHasMicrophone] = useState(true)
  const [deviceCheckDone, setDeviceCheckDone] = useState(false)
  
  const zoomMeetingRef = useRef<ZoomMeetingHandle>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/meeting/${meetingId}?pass=${password}`
      setShareUrl(url)
    }
  }, [meetingId, password])

  // Check available devices
  useEffect(() => {
    const checkDevices = async () => {
      if (!navigator.mediaDevices) {
        console.log('Media devices not supported')
        setDeviceCheckDone(true)
        return
      }
      
      try {
        const devices = await navigator.mediaDevices.enumerateDevices()
        const cameraExists = devices.some(device => 
          device.kind === 'videoinput' && device.deviceId !== ''
        )
        const micExists = devices.some(device => 
          device.kind === 'audioinput' && device.deviceId !== ''
        )
        
        setHasCamera(cameraExists)
        setHasMicrophone(micExists)
        console.log('Devices found - Camera:', cameraExists, 'Microphone:', micExists)
      } catch (error) {
        console.warn('Device enumeration failed:', error)
      } finally {
        setDeviceCheckDone(true)
      }
    }
    
    checkDevices()
  }, [])

const requestPermissions = async () => {
  setLoadingPermissions(true);
  try {
    let micGranted = false;
    let cameraGranted = false;
    
    // FIRST: Check if devices exist
    const devices = await navigator.mediaDevices.enumerateDevices();
    console.log('Available devices:', devices);
    
    const hasMicrophone = devices.some(d => d.kind === 'audioinput' && d.deviceId);
    const hasCamera = devices.some(d => d.kind === 'videoinput' && d.deviceId);
    
    console.log('Microphone available:', hasMicrophone);
    console.log('Camera available:', hasCamera);
    
    // SIMPLIFIED: Try only if device exists
    if (hasMicrophone) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          audio: { 
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        micGranted = true;
        console.log('✅ Microphone permission granted');
      } catch (err) {
        console.warn('⚠️ Microphone permission denied:', err);
      }
    } else {
      console.warn('❌ No microphone detected');
    }
    
    if (hasCamera) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
          video: { 
            width: { ideal: 1280 },
            height: { ideal: 720 }
          } 
        });
        stream.getTracks().forEach(track => track.stop());
        cameraGranted = true;
        console.log('✅ Camera permission granted');
      } catch (err) {
        console.warn('⚠️ Camera permission denied:', err);
      }
    } else {
      console.warn('❌ No camera detected');
    }
    
    // Allow meeting WITHOUT microphone (listen-only mode)
    setPermissionsGranted(true);
    
    // Show appropriate message
    if (micGranted && cameraGranted) {
      alert('✅ Permissions granted! Ready to host.');
    } else if (micGranted && !cameraGranted) {
      alert('✅ Microphone ready! Meeting will be audio-only.');
    } else if (!micGranted && hasMicrophone) {
      alert('⚠️ Microphone permission denied. You can still host as listen-only.');
    } else {
      alert('ℹ️ No microphone detected. You can still host - participants can hear you through chat.');
    }
    
  } catch (error) {
    console.error('Permission error:', error);
    // Still allow proceeding
    setPermissionsGranted(true);
    alert('⚠️ Device check failed, but you can still proceed with hosting.');
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
    console.log('Starting meeting...')
    
    if (!permissionsGranted) {
      await requestPermissions()
      if (!permissionsGranted) {
        return
      }
    }
    
    setMeetingStarted(true)
  }

  // Host Control Functions
  const toggleAudio = () => {
    if (zoomMeetingRef.current) {
      zoomMeetingRef.current.toggleAudio()
      setAudioEnabled(!audioEnabled)
    }
  }

  const toggleVideo = () => {
    if (zoomMeetingRef.current && hasCamera) {
      zoomMeetingRef.current.toggleVideo()
      setVideoEnabled(!videoEnabled)
    }
  }

  const startScreenShare = async () => {
    if (!zoomMeetingRef.current) return
    
    try {
      if (!navigator.mediaDevices.getDisplayMedia) {
        alert('Screen sharing not supported in this browser')
        return
      }
      
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
      console.error('Screen share error:', error)
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
      alert('Meeting ended')
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




{/* Host Page ke end mein add karo */}
<div className="fixed bottom-4 right-4 z-50">
  <button 
    onClick={() => {
      console.log('=== DEBUG ===');
      console.log('Zoom SDK loaded:', !!window.ZoomMtg);
      console.log('Window.ZoomMtg:', window.ZoomMtg);
      console.log('All functions:', Object.keys(window.ZoomMtg || {}));
      
      // Force join meeting
      if (zoomMeetingRef.current) {
        console.log('Forcing join...');
        zoomMeetingRef.current.joinMeeting();
      }
    }}
    className="bg-yellow-600 text-white p-3 rounded-lg font-bold"
  >
    🐞 Debug Zoom
  </button>
</div>


        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Area */}
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

                {/* Pre-Meeting Setup */}
                {!meetingStarted && (
                  <div className="mb-6 p-6 bg-gray-900/50 rounded-xl border border-gray-700">
                    <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                      <span className="text-3xl">👑</span>
                    </div>
                    <h3 className="text-2xl font-bold mb-3 text-center">Ready to Host</h3>
                    
                    {/* Device Status */}
                    {deviceCheckDone && (
                      <div className="mb-4 p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-bold mb-2">Device Status:</h4>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${hasMicrophone ? 'bg-green-500' : 'bg-red-500'}`}></div>
                            <span>Microphone: {hasMicrophone ? 'Available' : 'Not Found'}</span>
                          </div>
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${hasCamera ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                            <span>Camera: {hasCamera ? 'Available' : 'Not Found (Optional)'}</span>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Permissions Section */}
                    {!permissionsGranted && (
                      <div className="mb-4 p-4 bg-yellow-900/30 rounded-lg">
                        <h4 className="font-bold text-yellow-300 mb-2 flex items-center">
                          <FaInfoCircle className="mr-2" />
                          Permissions Required
                        </h4>
                        <p className="text-yellow-200 text-sm mb-3">
                          Microphone access is required to host the meeting. 
                          Camera is optional for video.
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
                            'Allow Microphone Access'
                          )}
                        </button>
                      </div>
                    )}
                    
                    <p className="text-gray-400 text-center mb-6">
                      {permissionsGranted 
                        ? 'Click below to start hosting' 
                        : 'Allow microphone access first'}
                    </p>
                    
                    <button
                      onClick={startMeeting}
                      disabled={!permissionsGranted}
                      className="w-full px-10 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg text-xl font-bold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Start Meeting as Host
                    </button>
                  </div>
                )}

                {/* Meeting Display */}
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
                        <p className="text-gray-400">
                          {permissionsGranted 
                            ? 'Ready to start hosting' 
                            : 'Setup required'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Host Controls */}
                {meetingStarted && (
                  <div className="bg-gray-900 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-bold mb-4 text-center">Host Controls</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {/* Audio Control */}
                      <button
                        onClick={toggleAudio}
                        disabled={!hasMicrophone}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          audioEnabled && hasMicrophone
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : !hasMicrophone
                            ? 'bg-gray-700 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        } ${!hasMicrophone ? 'opacity-60' : ''}`}
                        title={!hasMicrophone ? 'No microphone available' : ''}
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

                      {/* Video Control */}
                      <button
                        onClick={toggleVideo}
                        disabled={!hasCamera}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          videoEnabled && hasCamera
                            ? 'bg-blue-600 hover:bg-blue-700' 
                            : !hasCamera
                            ? 'bg-gray-700 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700'
                        } ${!hasCamera ? 'opacity-60' : ''}`}
                        title={!hasCamera ? 'No camera available' : ''}
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

                      {/* Screen Share */}
                      <button
                        onClick={screenSharing ? stopScreenShare : startScreenShare}
                        className={`flex flex-col items-center justify-center p-4 rounded-lg font-bold transition ${
                          screenSharing 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        <FaDesktop className="h-7 w-7 mb-2" />
                        <span className="text-sm">
                          {screenSharing ? 'Stop Share' : 'Share Screen'}
                        </span>
                      </button>

                      {/* End Meeting */}
                      <button
                        onClick={endMeeting}
                        className="flex flex-col items-center justify-center p-4 rounded-lg font-bold bg-gradient-to-r from-red-600 to-red-700 hover:opacity-90 transition"
                      >
                        <FaPhoneSlash className="h-7 w-7 mb-2" />
                        <span className="text-sm">End Meeting</span>
                      </button>
                    </div>
                    
                    {/* Status Bar */}
                    <div className="mt-4 grid grid-cols-3 gap-3 text-center text-sm">
                      <div className={`p-2 rounded ${audioEnabled ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                        Audio: {audioEnabled ? 'ON' : 'OFF'}
                      </div>
                      <div className={`p-2 rounded ${videoEnabled && hasCamera ? 'bg-green-900/30 text-green-400' : !hasCamera ? 'bg-gray-800 text-gray-400' : 'bg-red-900/30 text-red-400'}`}>
                        Video: {!hasCamera ? 'N/A' : videoEnabled ? 'ON' : 'OFF'}
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
                  <p className="text-green-400 text-sm mt-1">✓ Copied to clipboard</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Share this link - no Zoom app needed
                </p>
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

            {/* Tips Section */}
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
                <li className="flex items-start">
                  <span className="text-green-400 mr-2">•</span>
                  <span>Use participant link for easy joining</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}