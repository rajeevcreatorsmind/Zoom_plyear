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
  role?: number // 0 = participant, 1 = host
  autoJoin?: boolean // NEW: Auto join when meeting starts
  onJoin?: () => void // NEW: Callback when joined
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
  password = '123456',
  role = 1,
  autoJoin = false,
  onJoin
}: ZoomMeetingProps, ref) => {
  const [loading, setLoading] = useState(true)
  const [videoOn, setVideoOn] = useState(true)
  const [audioOn, setAudioOn] = useState(true)
  const [time, setTime] = useState('00:00')
  const [zoomReady, setZoomReady] = useState(false)
  const [isJoined, setIsJoined] = useState(false)
  const [error, setError] = useState('')
  
  // Use refs to track state that shouldn't trigger re-renders
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

  // Timer
  useEffect(() => {
    if (!isJoined) return;
    
    const startTime = Date.now();
    const timer = setInterval(() => {
      const seconds = Math.floor((Date.now() - startTime) / 1000);
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      setTime(`${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`);
    }, 1000);

    return () => clearInterval(timer);
  }, [isJoined]);

  // Load dependencies only once
  useEffect(() => {
    if (isInitializedRef.current) return;

    const loadZoomDependencies = () => {
      if (dependenciesLoadedRef.current) {
        loadZoomSDK();
        return;
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
      ];

      const missingDeps = dependencies.filter(dep => !dep.check());
      
      if (missingDeps.length === 0) {
        console.log('All dependencies already loaded');
        dependenciesLoadedRef.current = true;
        loadZoomSDK();
        return;
      }

      console.log(`Loading ${missingDeps.length} missing dependencies...`);

      let loadedCount = 0;
      const totalToLoad = missingDeps.length;

      missingDeps.forEach(dep => {
        if (document.getElementById(dep.id)) {
          loadedCount++;
          if (loadedCount === totalToLoad) {
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
          return;
        }

        const script = document.createElement('script');
        script.id = dep.id;
        script.src = dep.url;
        script.async = false;
        script.onload = () => {
          loadedCount++;
          console.log(`Loaded: ${dep.id}`);
          if (loadedCount === totalToLoad) {
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
        };
        script.onerror = () => {
          console.error(`Failed to load: ${dep.id}`);
          loadedCount++;
          if (loadedCount === totalToLoad) {
            dependenciesLoadedRef.current = true;
            loadZoomSDK();
          }
        };
        document.head.appendChild(script);
      });
    };

    const loadZoomSDK = () => {
      if (window.ZoomMtg) {
        console.log('Zoom SDK already loaded');
        setZoomReady(true);
        setLoading(false);
        isInitializedRef.current = true;
        return;
      }

      if (document.getElementById('zoom-sdk')) {
        console.log('Zoom SDK already loading...');
        return;
      }

      console.log('Loading Zoom SDK...');
      
      const script = document.createElement('script');
      script.id = 'zoom-sdk';
      script.src = 'https://source.zoom.us/zoom-meeting-2.18.0.min.js';
      script.async = true;
      script.onload = () => {
        console.log('Zoom SDK loaded');
        
        const checkZoom = setInterval(() => {
          if (window.ZoomMtg && typeof window.ZoomMtg.setZoomJSLib === 'function') {
            clearInterval(checkZoom);
            console.log('ZoomMtg fully available');
            setZoomReady(true);
            setLoading(false);
            isInitializedRef.current = true;
            
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
          }
        }, 100);
        
        setTimeout(() => {
          clearInterval(checkZoom);
          if (!window.ZoomMtg) {
            console.error('Zoom SDK timeout');
            setError('Failed to load Zoom SDK (timeout)');
            setLoading(false);
          }
        }, 10000);
      };
      script.onerror = () => {
        console.error('Failed to load Zoom SDK script');
        setError('Failed to load Zoom SDK');
        setLoading(false);
      };
      
      document.head.appendChild(script);
    };

    loadZoomDependencies();
  }, []);

  // Auto-join when zoom is ready and autoJoin is true
  useEffect(() => {
    if (autoJoin && zoomReady && !isJoined && !loading && !joinAttemptedRef.current) {
      console.log('Auto-joining meeting...');
      joinMeeting();
    }
  }, [zoomReady, autoJoin, isJoined, loading]);

  const joinMeeting = async () => {
    console.log('=== JOIN MEETING FUNCTION STARTED ===');
    
    if (!window.ZoomMtg || !window.ZoomMtg.setZoomJSLib) {
      console.error('Zoom SDK not properly loaded');
      setError('Zoom SDK not properly loaded');
      return;
    }

    if (joinAttemptedRef.current) {
      console.log('Join already attempted, skipping');
      return;
    }

    try {
      joinAttemptedRef.current = true;
      setLoading(true);
      setError('');
      
      console.log('1. Setting up Zoom environment...');
      
      // Clear previous meeting
      try {
        const root = document.getElementById('zmmtg-root');
        if (root) {
          root.innerHTML = '';
        }
      } catch (e) {
        console.log('Cleanup error:', e);
      }

      // Initialize Zoom
      window.ZoomMtg.setZoomJSLib('https://source.zoom.us/2.18.0/lib', '/av');
      window.ZoomMtg.preLoadWasm();
      window.ZoomMtg.prepareWebSDK();
      
      console.log('2. Zoom setup done, fetching signature...');
      
      // Get signature
      const signatureResponse = await fetch('/api/zoom/signature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingNumber,
          role: role.toString()
        }),
      });

      console.log('3. Signature response status:', signatureResponse.status);
      
      if (!signatureResponse.ok) {
        throw new Error(`HTTP error! status: ${signatureResponse.status}`);
      }

      const signatureData = await signatureResponse.json();
      
      if (!signatureData.success) {
        console.error('4. Signature error:', signatureData.error);
        throw new Error(signatureData.error || 'Failed to get signature');
      }

      console.log('5. Got signature:', {
        signatureLength: signatureData.signature?.length,
        meetingNumber: signatureData.meetingNumber,
        role: signatureData.role
      });

      // Wait a bit
      await new Promise(resolve => setTimeout(resolve, 1000));

      window.ZoomMtg.init({
        leaveUrl: window.location.origin,
        isSupportAV: true,
        success: () => {
          console.log('6. Zoom init success! Now joining...');

          window.ZoomMtg.join({
            signature: signatureData.signature,
            meetingNumber: signatureData.meetingNumber,
            userName: userName,
            passWord: password,
            success: (success: any) => {
              console.log('✅ JOIN SUCCESS!', success);
              setIsJoined(true);
              setLoading(false);
              onJoin?.(); // Call the callback

              // Try to start video/audio after join
              setTimeout(() => {
                try {
                  window.ZoomMtg.unmute({ mute: false });
                } catch (e) { console.log('Unmute failed') }
              }, 2000);
            },
            error: (error: any) => {
              console.error('❌ JOIN ERROR:', error);
              setError(`Join failed: ${error.errorMessage || error.errorCode || JSON.stringify(error)}`);
              setLoading(false);
              joinAttemptedRef.current = false;
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

      // Global error handler
      window.addEventListener('error', (e) => {
        console.error('Global Zoom error:', e);
        if (e.message?.includes('Zoom') || e.message?.includes('meeting')) {
          setError(`Zoom error: ${e.message}`);
        }
      });

    } catch (err: any) {
      console.error('11. Catch block error:', err);
      console.error('Error stack:', err.stack);
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
      <div className="w-full h-full bg-black rounded-xl flex flex-col items-center justify-center">
        <FaSpinner className="h-12 w-12 text-blue-500 animate-spin mb-4" />
        <p className="text-white text-lg">Loading Zoom Meeting...</p>
        <p className="text-gray-400 text-sm mt-2">Meeting ID: {meetingNumber}</p>
        <p className="text-gray-500 text-xs mt-1">This may take a few seconds</p>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden relative">
      {/* Zoom Meeting Container */}
      <div id="zmmtg-root" className="w-full h-full"></div>
      
      {/* Status Overlay - Only show if NOT joined */}
      {!isJoined && !autoJoin && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/90">
          <div className="text-center p-8 rounded-xl bg-black/70 max-w-md">
            <div className="w-40 h-40 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaVideo className="h-20 w-20 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">{userName}</h3>
            <p className="text-gray-300">Meeting ID: {meetingNumber}</p>
            <p className="text-gray-400 mt-1">Role: {role === 1 ? 'Host' : 'Participant'}</p>
            
            <div className="mt-6">
              {error && (
                <div className="bg-red-900/50 text-red-300 p-3 rounded-lg mb-4">
                  <p className="font-semibold">Error:</p>
                  <p>{error}</p>
                  <button
                    onClick={() => setError('')}
                    className="text-xs underline mt-1"
                  >
                    Dismiss
                  </button>
                </div>
              )}
              
              <div className="inline-flex items-center bg-green-900/30 px-4 py-2 rounded-full mb-4">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  Ready to Join
                </span>
              </div>
              
              {zoomReady && !loading && (
                <button
                  onClick={joinMeeting}
                  className="block w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg font-bold hover:opacity-90 transition-all duration-200 active:scale-95"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className="animate-spin inline mr-2" />
                      Joining...
                    </>
                  ) : (
                    'Join Meeting Now'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Controls - Only show when joined */}
      {isJoined && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-4 bg-gray-900/80 backdrop-blur-sm px-6 py-3 rounded-full z-20">
          <button
            onClick={toggleAudio}
            className={`p-3 rounded-full ${audioOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
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
            className={`p-3 rounded-full ${videoOn ? 'bg-blue-600 hover:bg-blue-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
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
            className="px-6 py-2 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Leave Meeting
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

      {/* Timer */}
      {isJoined && (
        <div className="absolute top-4 right-4 z-10 bg-black/50 px-3 py-2 rounded-full">
          <span className="text-white text-sm font-mono">{time}</span>
        </div>
      )}

      {/* Error Message */}
      {error && isJoined && (
        <div className="absolute top-12 right-4 bg-red-900/80 text-white p-3 rounded-lg max-w-xs">
          <p className="text-sm font-semibold">Meeting Error:</p>
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
  );
});

ZoomMeeting.displayName = 'ZoomMeeting';
export default ZoomMeeting;