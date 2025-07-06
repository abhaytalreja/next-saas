'use client'

import { ProtectedLayout } from '@nextsaas/auth'

export default function DashboardPage() {
  return (
    <ProtectedLayout>
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="border-4 border-dashed border-gray-200 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome to your Dashboard!
              </h1>
              <p className="text-gray-600">
                Authentication is working correctly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}