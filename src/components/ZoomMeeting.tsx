'use client'

import { useEffect, useState, useRef, forwardRef, useImperativeHandle } from 'react'
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
  role?: number
  autoJoin?: boolean
  onJoin?: () => void
}

export interface ZoomMeetingHandle {
  joinMeeting: () => Promise<void>
  leaveMeeting: () => void
  toggleAudio: () => void
  toggleVideo: () => void
  isJoined: boolean
}

const ZoomMeeting = forwardRef<ZoomMeetingHandle, ZoomMeetingProps>(({ 
  meetingNumber, 
  userName,
  password = '',
  role = 1,
  autoJoin = false,
  onJoin
}: ZoomMeetingProps, ref) => {
  const [loading, setLoading] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [zoomReady, setZoomReady] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState('')
  
  const isInitializedRef = useRef(false)
  const dependenciesLoadedRef = useRef(false)
  const joinAttemptedRef = useRef(false)

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    joinMeeting: () => joinMeeting(),
    leaveMeeting: () => leaveMeeting(),
    toggleAudio: () => toggleAudio(),
    toggleVideo: () => toggleVideo(),
    isJoined: isJoined
  }));

  // Load dependencies - FIXED SEQUENCE
  useEffect(() => {
    if (isInitializedRef.current) return;

    console.log('🔧 Starting dependency loading...');

    const loadDependencies = () => {
      // Check if already loaded
      if (window.React && window.ReactDOM && window.Redux && window.ReduxThunk && window._) {
        console.log('✅ Dependencies already loaded');
        dependenciesLoadedRef.current = true;
        loadZoomSDK();
        return;
      }

      const dependencies = [
        { 
          id: 'react-js',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/react/17.0.2/umd/react.production.min.js',
          global: 'React',
          check: () => window.React
        },
        { 
          id: 'react-dom-js',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/react-dom/17.0.2/umd/react-dom.production.min.js',
          global: 'ReactDOM',
          check: () => window.ReactDOM
        },
        { 
          id: 'redux-js',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/redux/4.1.2/redux.min.js',
          global: 'Redux',
          check: () => window.Redux
        },
        { 
          id: 'redux-thunk-js',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/redux-thunk/2.4.1/redux-thunk.min.js',
          global: 'ReduxThunk',
          check: () => window.ReduxThunk
        },
        { 
          id: 'lodash-js',
          url: 'https://cdnjs.cloudflare.com/ajax/libs/lodash.js/4.17.21/lodash.min.js',
          global: '_',
          check: () => window._
        }
      ];

      let loaded = 0;
      const total = dependencies.length;

      console.log(`📦 Loading ${total} dependencies...`);

      dependencies.forEach(dep => {
        // Skip if already loaded
        if (dep.check()) {
          loaded++;
          if (loaded === total) {
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
          return;
        }

        // Skip if already loading
        if (document.getElementById(dep.id)) {
          return;
        }

        const script = document.createElement('script');
        script.id = dep.id;
        script.src = dep.url;
        script.async = false; // IMPORTANT: Load in order
        script.onload = () => {
          console.log(`✅ ${dep.global} loaded`);
          loaded++;
          if (loaded === total) {
            console.log('🎉 All dependencies loaded');
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
        };
        script.onerror = () => {
          console.error(`❌ Failed to load ${dep.global}`);
          loaded++;
          if (loaded === total) {
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
        };
        document.head.appendChild(script);
      });
    };

    const loadZoomSDK = () => {
      if (!dependenciesLoadedRef.current) {
        console.log('⏳ Waiting for dependencies...');
        setTimeout(loadZoomSDK, 500);
        return;
      }

      console.log('🚀 Loading Zoom SDK...');

      // Add CSS first
      if (!document.querySelector('link[href*="source.zoom.us/2.18.0/css"]')) {
        const link1 = document.createElement('link');
        link1.href = 'https://source.zoom.us/2.18.0/css/bootstrap.css';
        link1.rel = 'stylesheet';
        document.head.appendChild(link1);

        const link2 = document.createElement('link');
        link2.href = 'https://source.zoom.us/2.18.0/css/react-select.css';
        link2.rel = 'stylesheet';
        document.head.appendChild(link2);
      }

      // Load Zoom SDK
      if (window.ZoomMtg) {
        console.log('✅ Zoom SDK already loaded');
        setZoomReady(true);
        setLoading(false);
        isInitializedRef.current = true;
        return;
      }

      const script = document.createElement('script');
      script.id = 'zoom-sdk';
      script.src = 'https://source.zoom.us/zoom-meeting-2.18.0.min.js';
      script.async = true;
      script.onload = () => {
        console.log('✅ Zoom SDK script loaded');
        
        // Wait for ZoomMtg to be fully available
        const checkInterval = setInterval(() => {
          if (window.ZoomMtg && typeof window.ZoomMtg.init === 'function') {
            clearInterval(checkInterval);
            console.log('🎉 ZoomMtg fully ready');
            setZoomReady(true);
            setLoading(false);
            isInitializedRef.current = true;
          }
        }, 100);
      };
      
      script.onerror = (err) => {
        console.error('❌ Failed to load Zoom SDK', err);
        setError('Failed to load Zoom SDK');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadDependencies();
  }, []);

  // Auto-join
  useEffect(() => {
    if (autoJoin && zoomReady && !isJoined && !loading && !joinAttemptedRef.current) {
      console.log('Auto-joining meeting...');
      joinMeeting();
    }
  }, [zoomReady, autoJoin, isJoined, loading]);

  const joinMeeting = async () => {
    console.log('=== JOIN MEETING ===');
    
    if (!window.ZoomMtg) {
      setError('Zoom SDK not ready');
      return;
    }

    if (joinAttemptedRef.current) {
      console.log('Join already attempted');
      return;
    }

    try {
      joinAttemptedRef.current = true;
      setLoading(true);
      setError('');
      
      // Clear previous meeting
      try {
        const root = document.getElementById('zmmtg-root');
        if (root) root.innerHTML = '';
      } catch (e) {}

      console.log('📞 Getting signature for meeting:', meetingNumber);
      
      // Get signature
      const signatureResponse = await fetch('/api/zoom/signature', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingNumber, role: role.toString() }),
      });

      if (!signatureResponse.ok) {
        throw new Error(`HTTP error: ${signatureResponse.status}`);
      }

      const signatureData = await signatureResponse.json();
      
      if (!signatureData.success) {
        throw new Error(signatureData.error || 'Failed to get signature');
      }

      console.log('✅ Signature received');
      
      // Initialize Zoom
      window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      window.ZoomMtg.preLoadWasm();
      window.ZoomMtg.prepareWebSDK();
      
      window.ZoomMtg.init({
        leaveUrl: window.location.origin + '/',
        isSupportAV: true,
        success: () => {
          console.log('✅ Zoom init success! Joining...');

          window.ZoomMtg.join({
            signature: signatureData.signature,
            sdkKey: 'dFLvsjSbTa6wBaF1w6Evbw', // 🔥 HARDCODED SDK KEY
            meetingNumber: signatureData.meetingNumber,
            userName: userName,
            passWord: password,
            success: (success: any) => {
              console.log('🎉 ✅ JOIN SUCCESS!', success);
              setIsJoined(true);
              setLoading(false);
              onJoin?.();
              
              // Show success alert
              alert('✅ Meeting joined successfully! Check your audio.');
            },
            error: (error: any) => {
              console.error('❌ Join error:', error);
              setError(`Join failed: ${error.errorMessage || error.errorCode || 'Unknown error'}`);
              setLoading(false);
              joinAttemptedRef.current = false;
              alert('❌ Join failed: ' + JSON.stringify(error));
            }
          });
        },
        error: (err: any) => {
          console.error('❌ Init error:', err);
          setError(`Init failed: ${err.message}`);
          setLoading(false);
          joinAttemptedRef.current = false;
        }
      });

    } catch (err: any) {
      console.error('❌ Catch error:', err);
      setError(err.message || 'Failed to join meeting');
      setLoading(false);
      joinAttemptedRef.current = false;
    }
  };

  const toggleAudio = () => {
    if (!window.ZoomMtg || !isJoined) return;
    
    try {
      if (audioOn) {
        window.ZoomMtg.muteAudio('all');
        setAudioOn(false);
      } else {
        window.ZoomMtg.unmuteAudio('all');
        setAudioOn(true);
      }
    } catch (err) {
      console.error('Toggle audio error:', err);
    }
  };

  const toggleVideo = () => {
    if (!window.ZoomMtg || !isJoined) return;
    
    try {
      if (videoOn) {
        window.ZoomMtg.muteVideo();
        setVideoOn(false);
      } else {
        window.ZoomMtg.unmuteVideo();
        setVideoOn(true);
      }
    } catch (err) {
      console.error('Toggle video error:', err);
    }
  };

  const leaveMeeting = () => {
    if (window.ZoomMtg && isJoined) {
      try {
        window.ZoomMtg.leaveMeeting();
        setIsJoined(false);
        joinAttemptedRef.current = false;
      } catch (err) {
        console.error('Leave error:', err);
      }
    }
  };

  if (loading && !zoomReady) {
    return (
      <div className="w-full h-full bg-black flex flex-col items-center justify-center">
        <FaSpinner className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">Loading Zoom...</p>
        <p className="text-gray-400 text-sm mt-2">Meeting ID: {meetingNumber}</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
      <div id="zmmtg-root" className="w-full h-full"></div>
      
      {!isJoined && !autoJoin && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <div className="text-center p-8 rounded-xl bg-black/70 max-w-md">
            <div className="w-40 h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaVideo className="h-20 w-20 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userName}</h3>
            <p className="text-gray-300">Meeting ID: {meetingNumber}</p>
            
            <div className="mt-6">
              {error && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                </div>
              )}
              
              {zoomReady && !loading && (
                <button
                  onClick={joinMeeting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90"
                  disabled={loading}
                >
                  {loading ? 'Joining...' : 'Join Meeting'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {isJoined && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full z-20">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${audioOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'}`}
            title={audioOn ? 'Mute Audio' : 'Unmute Audio'}
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
            title={videoOn ? 'Stop Video' : 'Start Video'}
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

      <div className="absolute top-4 left-4 z-10">
        <div className={`flex items-center px-4 py-2 rounded-full ${isJoined ? 'bg-green-900/80' : 'bg-blue-900/80'}`}>
          <div className={`w-3 h-3 rounded-full mr-2 ${isJoined ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}></div>
          <span className="text-white text-sm">
            {isJoined ? 'Live' : 'Ready'}
          </span>
        </div>
      </div>

      {error && isJoined && (
        <div className="absolute top-12 right-4 bg-red-900/80 text-white p-3 rounded-lg max-w-xs">
          <p className="text-sm font-semibold">Error:</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
    </div>
  );
});

ZoomMeeting.displayName = 'ZoomMeeting';
export default ZoomMeeting;