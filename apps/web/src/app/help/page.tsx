'use client'

import React from 'react'

export default function HelpCenterPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Help Center</h1>
        <p className="text-gray-600 dark:text-gray-400">Find answers and get support</p>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Help Center coming soon</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Documentation and support resources</p>
      </div>
    </div>
  )
}