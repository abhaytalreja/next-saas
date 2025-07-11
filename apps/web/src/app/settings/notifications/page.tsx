'use client'

import React from 'react'

export default function NotificationsPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Notifications</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your notification preferences</p>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM11 19l-7-7 3-3 7 7-3 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Notification settings coming soon</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">Configure email and push notifications</p>
      </div>
    </div>
  )
}