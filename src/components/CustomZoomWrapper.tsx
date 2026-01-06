'use client'
import { useState } from 'react'
import { FaUsers, FaVideo, FaMicrophone, FaShareSquare, FaCog, FaBell } from 'react-icons/fa'

export default function CustomZoomWrapper({ meetingId, password }: { meetingId: string, password: string }) {
  const [participants, setParticipants] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOn, setIsVideoOn] = useState(true)
  
  const zoomUrl = `https://zoom.us/wc/join/${meetingId}?pwd=${password}`

  return (
    <div className="w-full h-full flex flex-col bg-gray-900">
      
      {/* YOUR WEBSITE HEADER */}
      <div className="bg-gradient-to-r from-purple-900 to-blue-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl font-bold text-white">🚀 MyMeetingApp</div>
          <div className="flex items-center text-white">
            <FaBell className="mr-2" />
            <span>Live Meeting</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-black/30 px-4 py-2 rounded-full">
            <FaUsers className="mr-2 text-green-400" />
            <span className="text-white">{participants}在线</span>
          </div>
          <button className="bg-white text-purple-700 px-4 py-2 rounded-lg font-bold">
            Invite People
          </button>
        </div>
      </div>

      {/* MAIN CONTENT - YOUR LAYOUT + ZOOM */}
      <div className="flex-1 flex">
        
        {/* LEFT SIDEBAR - YOUR CONTROLS */}
        <div className="w-80 bg-gray-800 border-r border-gray-700 p-6">
          <h3 className="text-white text-lg font-bold mb-6">Meeting Controls</h3>
          
          <div className="space-y-4">
            <button 
              onClick={() => setIsMuted(!isMuted)}
              className={`w-full flex items-center justify-center py-3 rounded-lg ${isMuted ? 'bg-red-600' : 'bg-green-600'} text-white font-bold`}
            >
              <FaMicrophone className="mr-3" />
              {isMuted ? 'Unmute' : 'Mute'}
            </button>
            
            <button 
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={`w-full flex items-center justify-center py-3 rounded-lg ${isVideoOn ? 'bg-blue-600' : 'bg-gray-600'} text-white font-bold`}
            >
              <FaVideo className="mr-3" />
              {isVideoOn ? 'Stop Video' : 'Start Video'}
            </button>
            
            <button className="w-full flex items-center justify-center py-3 rounded-lg bg-purple-600 text-white font-bold">
              <FaShareSquare className="mr-3" />
              Share Screen
            </button>
            
            <button className="w-full flex items-center justify-center py-3 rounded-lg bg-yellow-600 text-white font-bold">
              <FaCog className="mr-3" />
              Settings
            </button>
          </div>
          
          {/* YOUR WEBSITE FEATURES */}
          <div className="mt-8">
            <h4 className="text-white mb-4">Meeting Details</h4>
            <div className="bg-gray-900 p-4 rounded-lg">
              <p className="text-gray-300 text-sm">Meeting ID</p>
              <p className="text-white font-bold text-lg">{meetingId}</p>
              
              <p className="text-gray-300 text-sm mt-3">Password</p>
              <p className="text-white font-bold">{password}</p>
              
              <button className="mt-4 w-full bg-blue-600 py-2 rounded text-white">
                Copy Invite Link
              </button>
            </div>
          </div>
        </div>

        {/* CENTER - ZOOM EMBEDDED (SMALLER) */}
        <div className="flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-700">
            <h2 className="text-white text-xl font-bold">Meeting in Progress</h2>
            <p className="text-gray-400">Hosted on <span className="text-blue-400">MyMeetingApp.com</span></p>
          </div>
          
          <div className="flex-1 p-4">
            {/* ZOOM IFRAME - SMALLER SIZE */}
            <div className="w-full h-full border-4 border-purple-500 rounded-xl overflow-hidden">
              <iframe
                src={zoomUrl}
                allow="camera; microphone"
                className="w-full h-full"
                title="Zoom Meeting"
              />
            </div>
            
            {/* YOUR BRANDING OVERLAY */}
            <div className="absolute bottom-6 right-6 bg-black/70 text-white px-4 py-2 rounded-lg">
              Powered by <span className="font-bold text-yellow-400">MyMeetingApp</span>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR - PARTICIPANTS LIST */}
        <div className="w-80 bg-gray-800 border-l border-gray-700 p-6">
          <h3 className="text-white text-lg font-bold mb-6">Participants ({participants})</h3>
          
          <div className="space-y-3">
            <div className="flex items-center bg-gray-900 p-3 rounded">
              <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">Y</span>
              </div>
              <div>
                <p className="text-white font-bold">You (Host)</p>
                <p className="text-green-400 text-sm">Speaking</p>
              </div>
            </div>
            
            <div className="flex items-center bg-gray-900 p-3 rounded">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                <span className="font-bold">J</span>
              </div>
              <div>
                <p className="text-white">John Doe</p>
                <p className="text-gray-400 text-sm">Joined 2 min ago</p>
              </div>
            </div>
          </div>
          
          {/* YOUR WEBSITE CHAT */}
          <div className="mt-8">
            <h4 className="text-white mb-4">Meeting Chat</h4>
            <div className="bg-gray-900 rounded-lg p-3 h-40 overflow-y-auto">
              <div className="text-white text-sm mb-2">
                <span className="text-blue-400">System:</span> Welcome to MyMeetingApp!
              </div>
            </div>
            <input 
              type="text" 
              placeholder="Type a message..."
              className="w-full mt-2 bg-gray-800 text-white p-2 rounded border border-gray-700"
            />
          </div>
        </div>
      </div>

      {/* YOUR WEBSITE FOOTER */}
      <div className="bg-gray-900 px-6 py-3 border-t border-gray-800 flex justify-between items-center">
        <div className="text-gray-400 text-sm">
          © 2024 MyMeetingApp.com • Secure Enterprise Meeting Solution
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-green-400 flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></div>
            Connection Secure
          </span>
          <button className="text-red-400 font-bold">
            End Meeting for All
          </button>
        </div>
      </div>
    </div>
  )
}