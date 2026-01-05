'use client'

import { useEffect, useRef } from 'react'
import React from 'react'

// YE WORKAROUND ADD KARNE SE ERROR PURA GAYAB HO JAYEGA
const internals = (React as any).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
if (internals) {
  if (!internals.ReactCurrentOwner) {
    internals.ReactCurrentOwner = { current: null }
  }
  if (!internals.ReactCurrentBatchConfig) {
    internals.ReactCurrentBatchConfig = { transition: 0 }
  }
}

interface ZoomMeetingProps {
  meetingNumber: string
  password: string
  userName: string
  role: number
}

export default function ZoomMeeting({ meetingNumber, password, userName, role }: ZoomMeetingProps) {
  const zoomRoot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const loadZoomSDK = async () => {
      try {
        const ZoomMtgEmbedded = (await import('@zoom/meetingsdk/embedded')).default
        const client = ZoomMtgEmbedded.createClient()

        const res = await fetch('/api/zoom/signature', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ meetingNumber, role })
        })
        const data = await res.json()
        const { signature } = data

        if (!zoomRoot.current) return

        await client.init({
          zoomAppRoot: zoomRoot.current,
          language: 'en-US',
          patchJsMedia: true,
        })

        await client.join({
          sdkKey: process.env.NEXT_PUBLIC_ZOOM_SDK_KEY!,
          signature,
          meetingNumber,
          password,
          userName,
        })

        console.log('✅ Meeting join ho gayi!')
      } catch (error) {
        console.error('❌ Error:', error)
      }
    }

    loadZoomSDK()
  }, [meetingNumber, password, userName, role])

  return (
    <div className="w-full h-full bg-black relative">
      <div ref={zoomRoot} className="absolute inset-0" />
    </div>
  )
}