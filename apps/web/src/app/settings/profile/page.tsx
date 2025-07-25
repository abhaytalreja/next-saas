'use client'

import React from 'react'
import { EmbeddedProfile } from '@nextsaas/auth'

export default function ProfileSettingsPage() {
  return (
    <div className="px-6 py-6 sm:px-8 sm:py-8" data-testid="profile-settings-page">
      <EmbeddedProfile
        title="Profile Management"
        description="Manage your personal information, avatar, activity, and account settings."
        defaultTab="profile"
      />
    </div>
  )
}
