'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to profile settings by default
    router.replace('/settings/profile')
  }, [router])

  return (
    <div className="p-6">
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400">Redirecting to settings...</p>
      </div>
    </div>
  )
}