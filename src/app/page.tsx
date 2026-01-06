// src/app/page.tsx - FULLY RESPONSIVE UI UPDATE (No backend changes)
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 sm:py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Professional Live Video Streaming
          </h1>
          <p className="text-lg sm:text-xl lg:text-2xl mb-10 max-w-3xl mx-auto opacity-90">
            Powered by Zoom API. Stream meetings, webinars, and events in high quality.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/join"
              className="w-full sm:w-auto bg-white text-blue-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors touch-manipulation"
            >
              Start Streaming
            </Link>
            <Link
              href="/join" // Keeping as /join per your current setup
              className="w-full sm:w-auto bg-transparent border-2 border-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors touch-manipulation"
            >
              Schedule Meeting
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 text-gray-900">
            Why Choose Our Platform
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-10">
            {features.map((feature, index) => (
              <div
                key={index}
                className="text-center p-6 bg-gray-50 rounded-2xl hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 p-4 bg-blue-100 rounded-full mb-5 text-3xl sm:text-4xl">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Live Demo Section - Responsive Placeholder */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-center mb-12 lg:mb-16 text-gray-900">
            Live Demo
          </h2>
          <div className="relative bg-black rounded-2xl aspect-video w-full max-w-5xl mx-auto overflow-hidden shadow-2xl">
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-8">
              <div className="text-6xl sm:text-7xl lg:text-8xl mb-6">🎥</div>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-semibold">
                Live Video Streaming Demo
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl text-gray-300 mt-4">
                Powered by Zoom Technology
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 sm:py-20 lg:py-28 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
            Ready to Start Streaming?
          </h2>
          <p className="text-lg sm:text-xl lg:text-2xl mb-10 opacity-90">
            Join thousands of users who trust our platform for their video meetings.
          </p>
          <Link
            href="/join"
            className="inline-block bg-white text-blue-600 px-10 py-5 rounded-xl text-xl sm:text-2xl font-bold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl touch-manipulation"
          >
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
}

const features = [
  {
    icon: '🎥',
    title: 'HD Video Quality',
    description: 'Crystal clear 1080p video streaming for all your meetings',
  },
  {
    icon: '👥',
    title: 'Scalable',
    description: 'Host up to 1000 participants in a single meeting',
  },
  {
    icon: '📊',
    title: 'Analytics',
    description: 'Detailed analytics and meeting insights',
  },
  {
    icon: '🔒',
    title: 'Secure',
    description: 'End-to-end encryption and secure connections',
  },
];