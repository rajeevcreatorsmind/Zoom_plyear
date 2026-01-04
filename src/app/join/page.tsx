'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { FaVideo, FaUser, FaLock, FaCalendar, FaSpinner, FaCheck, FaCopy, FaShare, FaExternalLinkAlt } from 'react-icons/fa'

export default function JoinPage() {
  const router = useRouter()
  const [meetingType, setMeetingType] = useState('join')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [createdMeeting, setCreatedMeeting] = useState<any>(null)
  const [formData, setFormData] = useState({
    meetingId: '',
    password: '',
    userName: 'Guest',
    meetingTopic: '',
    startTime: '',
    duration: '60',
    hostVideo: true,
    participantVideo: true,
    waitingRoom: false,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setCreatedMeeting(null);
    
    try {
      const response = await fetch('/api/zoom/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: formData.meetingTopic,
          startTime: formData.startTime,
          duration: formData.duration,
        }),
      });

      const data = await response.json();
      console.log('Response:', data);
      
      if (data.success) {
        setCreatedMeeting(data);
        setMessage({
          type: 'success',
          text: '✅ Meeting created successfully! Details below.'
        });
        
        // Scroll to meeting details
        setTimeout(() => {
          document.getElementById('meeting-details')?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        setMessage({
          type: 'error',
          text: data.error || 'Failed to create meeting'
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    alert(message);
  };

  const shareMeeting = () => {
    if (createdMeeting) {
      const shareText = `Join my Zoom meeting!\n\nMeeting ID: ${createdMeeting.meeting_id}\nPassword: ${createdMeeting.password}\nJoin Link: ${createdMeeting.join_url}`;
      
      if (navigator.share) {
        navigator.share({
          title: 'Zoom Meeting Invitation',
          text: shareText,
          url: createdMeeting.join_url,
        });
      } else {
        copyToClipboard(shareText, 'Meeting details copied to clipboard!');
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
            <FaVideo className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {meetingType === 'join' ? 'Join a Meeting' : 'Schedule a Meeting'}
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            {meetingType === 'join' 
              ? 'Enter meeting ID to join existing meeting' 
              : 'Create a new meeting with custom settings'}
          </p>
        </div>

        {/* Message Alert */}
        {message && (
          <div className={`mb-8 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            <div className="flex items-center">
              {message.type === 'success' ? (
                <FaCheck className="h-5 w-5 mr-3" />
              ) : (
                <span className="h-5 w-5 mr-3">⚠️</span>
              )}
              <span>{message.text}</span>
            </div>
          </div>
        )}

{createdMeeting && (
  <div id="meeting-details" className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 shadow-lg">
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-green-800 flex items-center">
        <span className="mr-3">🎉</span>
        Meeting Created Successfully!
      </h2>
      <button
        onClick={shareMeeting}
        className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
      >
        <FaShare className="mr-2" />
        Share
      </button>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Meeting Information */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-green-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mr-3">
              📋
            </span>
            Meeting Information
          </h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 text-sm">Meeting ID</p>
              <div className="flex items-center">
                <p className="text-xl font-bold font-mono text-gray-900">{createdMeeting.meeting_id}</p>
                <button
                  onClick={() => copyToClipboard(createdMeeting.meeting_id, 'Meeting ID copied!')}
                  className="ml-3 text-blue-600 hover:text-blue-700"
                  title="Copy Meeting ID"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Password</p>
              <div className="flex items-center">
                <p className="text-xl font-bold text-gray-900">{createdMeeting.password}</p>
                <button
                  onClick={() => copyToClipboard(createdMeeting.password, 'Password copied!')}
                  className="ml-3 text-blue-600 hover:text-blue-700"
                  title="Copy Password"
                >
                  <FaCopy />
                </button>
              </div>
            </div>
            <div>
              <p className="text-gray-600 text-sm">Meeting Topic</p>
              <p className="text-lg text-gray-900">{formData.meetingTopic || 'Untitled Meeting'}</p>
            </div>
          </div>
        </div>

        {/* NEW: Browser Join Options */}
        <div className="bg-blue-50 p-5 rounded-xl border border-blue-200">
          <h3 className="font-bold text-blue-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              🌐
            </span>
            Join in Browser (No Zoom App)
          </h3>
          <div className="space-y-3">
            {/* For Host (You) */}
            <div>
              <p className="text-sm text-blue-700 mb-2">For You (Host):</p>
              <a
                href={`/host/${createdMeeting.meeting_id}?pass=${createdMeeting.password}&name=${encodeURIComponent(formData.userName)}`}
                className="block w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-bold text-center hover:opacity-90"
              >
                Start Hosting in Browser
              </a>
              <p className="text-xs text-blue-600 mt-1">No Zoom app needed!</p>
            </div>
            
            {/* For Participants */}
            <div>
              <p className="text-sm text-blue-700 mb-2">For Participants:</p>
              <a
                href={`/meeting/${createdMeeting.meeting_id}?pass=${createdMeeting.password}`}
                target="_blank"
                className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-lg font-bold text-center hover:opacity-90"
              >
                Join as Participant in Browser
              </a>
              <p className="text-xs text-blue-600 mt-1">Share this link</p>
            </div>
          </div>
        </div>
      </div>

      {/* Share Section */}
      <div className="space-y-6">
        <div className="bg-white p-5 rounded-xl border border-blue-100">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
              🔗
            </span>
            Share Meeting
          </h3>
          
          <div className="mb-4">
            <p className="text-gray-600 text-sm mb-2">Browser Join Link (No App):</p>
            <div className="flex items-center bg-gray-50 p-3 rounded-lg border">
              <code className="flex-1 text-sm text-gray-800 truncate">
                {typeof window !== 'undefined' ? `${window.location.origin}/meeting/${createdMeeting.meeting_id}?pass=${createdMeeting.password}` : 'Loading...'}
              </code>
              <button
                onClick={() => {
                  const link = typeof window !== 'undefined' ? `${window.location.origin}/meeting/${createdMeeting.meeting_id}?pass=${createdMeeting.password}` : '';
                  copyToClipboard(link, 'Browser link copied!');
                }}
                className="ml-3 text-blue-600 hover:text-blue-700 flex-shrink-0"
                title="Copy link"
              >
                <FaCopy />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Participants can join without Zoom app</p>
          </div>

          <div className="space-y-3">
            <p className="text-gray-600 text-sm">Share via:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => {
                  const text = `Join my meeting in browser (no Zoom app needed):\n${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${createdMeeting.meeting_id}?pass=${createdMeeting.password}\n\nOr use Zoom app:\nMeeting ID: ${createdMeeting.meeting_id}\nPassword: ${createdMeeting.password}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="bg-green-100 text-green-800 py-2 rounded-lg font-medium hover:bg-green-200"
              >
                WhatsApp
              </button>
              <button
                onClick={() => {
                  const text = `Join my meeting in browser (no Zoom app needed):\n${typeof window !== 'undefined' ? window.location.origin : ''}/meeting/${createdMeeting.meeting_id}?pass=${createdMeeting.password}\n\nOr use Zoom app:\nMeeting ID: ${createdMeeting.meeting_id}\nPassword: ${createdMeeting.password}`;
                  window.open(`mailto:?subject=Meeting Invitation&body=${encodeURIComponent(text)}`, '_blank');
                }}
                className="bg-red-100 text-red-800 py-2 rounded-lg font-medium hover:bg-red-200"
              >
                Email
              </button>
            </div>
          </div>
        </div>

        {/* Traditional Zoom Options */}
        <div className="bg-gray-50 p-5 rounded-xl border">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center">
            <span className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
              📱
            </span>
            Traditional Zoom
          </h3>
          <div className="space-y-3">
            <button
              onClick={() => window.open(createdMeeting.join_url, '_blank')}
              className="w-full flex items-center justify-center bg-green-600 text-white py-3 px-4 rounded-lg font-bold hover:opacity-90"
            >
              <FaExternalLinkAlt className="mr-3" />
              Join via Zoom App
            </button>
            <button
              onClick={() => window.open(`https://zoom.us/j/${createdMeeting.meeting_id}`, '_blank')}
              className="w-full border border-green-600 text-green-600 py-3 px-4 rounded-lg font-bold hover:bg-green-50"
            >
              Open in Zoom Web
            </button>
          </div>
        </div>
      </div>
    </div>

    {/* Notes */}
    <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-blue-800 font-semibold mb-1">For You (Host):</p>
          <p className="text-sm text-blue-700">
            Click "Start Hosting in Browser" to host without Zoom app. Everything works in browser!
          </p>
        </div>
        <div>
          <p className="text-sm text-blue-800 font-semibold mb-1">For Participants:</p>
          <p className="text-sm text-blue-700">
            Share the browser link. Participants can join without installing Zoom.
          </p>
        </div>
      </div>
    </div>
  </div>
)}

        {/* Toggle Buttons */}
        <div className="flex justify-center mb-8">
          <div className="bg-white p-1 rounded-xl shadow-sm inline-flex border">
            <button
              onClick={() => {
                setMeetingType('join')
                setMessage(null)
                setCreatedMeeting(null)
              }}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                meetingType === 'join' 
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow' 
                  : 'text-gray-700 hover:text-blue-600'
              }`}
            >
              Join Meeting
            </button>
            <button
              onClick={() => {
                setMeetingType('create')
                setMessage(null)
                setCreatedMeeting(null)
              }}
              className={`px-8 py-3 rounded-lg font-semibold transition-all ${
                meetingType === 'create' 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow' 
                  : 'text-gray-700 hover:text-purple-600'
              }`}
            >
              Create Meeting
            </button>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
          <form onSubmit={handleSubmit}>
            {meetingType === 'join' ? (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaVideo className="inline mr-2" />
                    Meeting ID *
                  </label>
                  <input
                    type="text"
                    name="meetingId"
                    value={formData.meetingId}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123 456 7890"
                    required
                    disabled={loading}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Enter the 9-11 digit meeting ID provided by the host
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaLock className="inline mr-2" />
                    Meeting Password (Optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter password if required"
                    disabled={loading}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaUser className="inline mr-2" />
                    Your Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your name"
                    required
                    disabled={loading}
                  />
                </div>
              </>
            ) : (
              <>
                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaVideo className="inline mr-2" />
                    Meeting Topic *
                  </label>
                  <input
                    type="text"
                    name="meetingTopic"
                    value={formData.meetingTopic}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Weekly Team Sync, Client Meeting, etc."
                    required
                    disabled={loading}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">
                      <FaCalendar className="inline mr-2" />
                      Start Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                      disabled={loading}
                    />
                  </div>

                  <div>
                    <label className="block text-gray-700 mb-2 font-semibold">
                      Duration
                    </label>
                    <select
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      disabled={loading}
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">60 minutes</option>
                      <option value="90">90 minutes</option>
                      <option value="120">120 minutes</option>
                    </select>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaLock className="inline mr-2" />
                    Meeting Password (Optional)
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Leave empty for auto-generated password"
                    disabled={loading}
                  />
                </div>

                <div className="mb-8">
                  <label className="block text-gray-700 mb-2 font-semibold">
                    <FaUser className="inline mr-2" />
                    Host Name *
                  </label>
                  <input
                    type="text"
                    name="userName"
                    value={formData.userName}
                    onChange={handleInputChange}
                    className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter host name"
                    required
                    disabled={loading}
                  />
                </div>

                {/* Meeting Settings */}
                <div className="mb-8 bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Meeting Settings</h3>
                  <div className="space-y-4">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="hostVideo"
                        checked={formData.hostVideo}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-gray-700">Start with host video on</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="participantVideo"
                        checked={formData.participantVideo}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-gray-700">Allow participants to start video</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        name="waitingRoom"
                        checked={formData.waitingRoom}
                        onChange={handleInputChange}
                        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        disabled={loading}
                      />
                      <span className="text-gray-700">Enable waiting room</span>
                    </label>
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-lg text-xl font-bold transition-all flex items-center justify-center ${
                loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : meetingType === 'join' 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:opacity-90' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90'
              } text-white`}
            >
              {loading ? (
                <>
                  <FaSpinner className="animate-spin mr-3" />
                  {meetingType === 'join' ? 'Joining Meeting...' : 'Creating Meeting...'}
                </>
              ) : meetingType === 'join' ? (
                'Join Meeting Now'
              ) : (
                'Create & Schedule Meeting'
              )}
            </button>
          </form>

          {/* Additional Info */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">
              {meetingType === 'join' ? 'Joining Instructions:' : 'Meeting Guidelines:'}
            </h3>
            <ul className="space-y-2 text-gray-600">
              {meetingType === 'join' ? (
                <>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Ensure you have a stable internet connection
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Test your audio and video before joining
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-500 mr-2">•</span>
                    Join 5 minutes before scheduled time
                  </li>
                </>
              ) : (
                <>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Meeting link will be generated after creation
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    Share the meeting ID and password with participants
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-500 mr-2">•</span>
                    You can start the meeting 5 minutes before scheduled time
                  </li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}