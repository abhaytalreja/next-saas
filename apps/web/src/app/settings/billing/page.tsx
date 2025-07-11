'use client'

import React from 'react'

export default function BillingPage() {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Billing</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing information</p>
      </div>
      
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
        </div>
        <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Billing management coming soon</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">View invoices and manage payment methods</p>
      </div>
    </div>
  )
}