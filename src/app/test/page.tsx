'use client'

export default function TestPage() {
  const createTestMeeting = async () => {
    try {
      const response = await fetch('/api/zoom/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: 'Test Meeting',
          startTime: new Date().toISOString(),
          duration: '30'
        }),
      })
      
      const data = await response.json()
      console.log('Meeting created:', data)
      
      if (data.success) {
        // Redirect to host page
        window.location.href = `/host/${data.meeting_id}?pass=${data.password}&name=Test+Host`
      }
    } catch (error) {
      console.error('Error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-3xl font-bold mb-8">Zoom Integration Test</h1>
      
      <div className="space-y-4">
        <button
          onClick={createTestMeeting}
          className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700"
        >
          Create Test Meeting
        </button>
        
        <div className="bg-gray-800 p-6 rounded-lg mt-8">
          <h2 className="text-xl font-bold mb-4">Test Steps:</h2>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Click "Create Test Meeting" above</li>
            <li>You'll be redirected to Host page</li>
            <li>Click "Start Meeting as Host"</li>
            <li>Allow camera/microphone permissions</li>
            <li>Share the participant link in another browser/device</li>
            <li>Test video/audio functionality</li>
          </ol>
        </div>
      </div>
    </div>
  )
}