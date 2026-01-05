// src/app/page.tsx - COMPLETE FIX
import Link from 'next/link'
// Remove VideoPlayer if causing issues

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professional Live Video Streaming
          </h1>
          <p className="text-xl mb-8 max-w-3xl mx-auto">
            Powered by Zoom API. Stream meetings, webinars, and events in high quality.
          </p>
          <div className="space-x-4">
            <Link 
              href="/join" 
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100"
            >
              Start Streaming
            </Link>
            <Link 
              href="/join" // Changed from /schedule
              className="bg-transparent border-2 border-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-white/10"
            >
              Schedule Meeting
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Why Choose Our Platform</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:shadow-lg transition-shadow">
                <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section - SIMPLIFIED */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-12">Live Demo</h2>
          <div className="bg-black rounded-xl aspect-video flex items-center justify-center">
            <div className="text-center text-white">
              <div className="text-6xl mb-4">🎥</div>
              <p className="text-xl">Live Video Streaming Demo</p>
              <p className="text-gray-400 mt-2">Powered by Zoom Technology</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start Streaming?</h2>
          <p className="text-xl mb-8">
            Join thousands of users who trust our platform for their video meetings.
          </p>
          <Link 
            href="/join" 
            className="bg-white text-blue-600 px-10 py-4 rounded-lg text-xl font-bold hover:bg-gray-100 inline-block"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    icon: '🎥',
    title: "HD Video Quality",
    description: "Crystal clear 1080p video streaming for all your meetings"
  },
  {
    icon: '👥',
    title: "Scalable",
    description: "Host up to 1000 participants in a single meeting"
  },
  {
    icon: '📊',
    title: "Analytics",
    description: "Detailed analytics and meeting insights"
  },
  {
    icon: '🔒',
    title: "Secure",
    description: "End-to-end encryption and secure connections"
  }
]