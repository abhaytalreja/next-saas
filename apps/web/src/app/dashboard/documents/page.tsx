'use client'

import React from 'react'

export default function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Documents</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your documents and files</p>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Document management coming soon</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Upload and organize your documents</p>
      </div>
    </div>
  )
}