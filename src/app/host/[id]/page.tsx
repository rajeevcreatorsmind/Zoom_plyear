'use client'

import { useParams, useSearchParams } from 'next/navigation'
import ZoomHost from '@/components/ZoomHost'

export default function HostPage() {
  const params = useParams()
  const searchParams = useSearchParams()
  
  const meetingId = params.id as string
  const password = searchParams.get('pass')
  const userName = searchParams.get('name') || 'Host'

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Host Control Panel
          </h1>
          <p className="text-gray-400">
            Meeting ID: <span className="font-mono">{meetingId}</span>
          </p>
        </div>
        
        <ZoomHost 
          meetingId={meetingId}
          password={password || ''}
          userName={userName}
        />
        
        <div className="mt-8 bg-gray-800 p-6 rounded-xl text-white">
          <h3 className="text-xl font-bold mb-4">Share with Participants:</h3>
          <div className="space-y-4">
            <div>
              <p className="text-gray-400 mb-2">Meeting Link for Participants:</p>
              <div className="flex items-center bg-gray-900 p-3 rounded">
                <code className="flex-1 text-blue-300">
                  {typeof window !== 'undefined' ? `${window.location.origin}/meeting/${meetingId}?pass=${password}` : 'Loading...'}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`${window.location.origin}/meeting/${meetingId}?pass=${password}`)}
                  className="ml-4 text-blue-400 hover:text-blue-300"
                >
                  Copy
                </button>
              </div>
            </div>
            
            <div>
              <p className="text-gray-400 mb-2">Direct Zoom Link:</p>
              <div className="flex items-center bg-gray-900 p-3 rounded">
                <code className="flex-1 text-green-300">
                  https://zoom.us/j/{meetingId}
                </code>
                <button
                  onClick={() => navigator.clipboard.writeText(`https://zoom.us/j/${meetingId}`)}
                  className="ml-4 text-green-400 hover:text-green-300"
                >
                  Copy
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}