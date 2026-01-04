'use client'

import Link from 'next/link'
import { useState } from 'react'
import { FaVideo, FaHome, FaCalendar, FaUser } from 'react-icons/fa'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <FaVideo className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              ZoomStream
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-blue-600 flex items-center">
              <FaHome className="mr-2" /> Home
            </Link>
            <Link href="/live" className="text-gray-700 hover:text-blue-600 flex items-center">
              <FaVideo className="mr-2" /> Live Now
            </Link>
            <Link href="/schedule" className="text-gray-700 hover:text-blue-600 flex items-center">
              <FaCalendar className="mr-2" /> Schedule
            </Link>
            <Link href="/join" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Join Meeting
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link href="/" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Home
              </Link>
              <Link href="/live" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Live Now
              </Link>
              <Link href="/schedule" className="block px-3 py-2 text-gray-700 hover:text-blue-600">
                Schedule
              </Link>
              <Link href="/join" className="block px-3 py-2 bg-blue-600 text-white rounded-lg">
                Join Meeting
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}