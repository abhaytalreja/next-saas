'use client'

import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input, Alert, Switch } from '@nextsaas/ui'
import { BellIcon, EyeIcon, PaintBrushIcon, GlobeAltIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { userPreferencesSchema, type UserPreferencesData } from '../../validation/profile-schemas'
import type { UserPreferences } from '../../types/user'

interface PreferencesFormProps {
  initialPreferences?: Partial<UserPreferences>
  onSave?: (preferences: UserPreferencesData) => Promise<{ success: boolean; error?: string }>
  onSuccess?: () => void
  className?: string
}

type PreferencesSection = 'theme' | 'notifications' | 'privacy' | 'accessibility' | 'data'

export function PreferencesForm({ 
  initialPreferences, 
  onSave,
  onSuccess, 
  className = '' 
}: PreferencesFormProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [activeSection, setActiveSection] = useState<PreferencesSection>('theme')

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isDirty },
  } = useForm<UserPreferencesData>({
    resolver: zodResolver(userPreferencesSchema),
    defaultValues: {
      theme: 'system',
      language: 'en',
      date_format: 'MM/dd/yyyy',
      time_format: '12h',
      email_notifications_enabled: true,
      email_frequency: 'immediate',
      email_digest: true,
      notify_security_alerts: true,
      notify_account_updates: true,
      notify_organization_updates: true,
      notify_project_updates: true,
      notify_mentions: true,
      notify_comments: true,
      notify_invitations: true,
      notify_billing_alerts: true,
      notify_feature_announcements: false,
      browser_notifications_enabled: false,
      desktop_notifications_enabled: false,
      mobile_notifications_enabled: false,
      marketing_emails: false,
      product_updates: true,
      newsletters: false,
      surveys: false,
      profile_visibility: 'organization',
      email_visibility: 'organization',
      activity_visibility: 'organization',
      hide_last_seen: false,
      hide_activity_status: false,
      quiet_hours_enabled: false,
      quiet_hours_start: '22:00',
      quiet_hours_end: '08:00',
      timezone_aware: true,
      reduce_motion: false,
      high_contrast: false,
      screen_reader_optimized: false,
      data_retention_period: 365,
      auto_delete_inactive: false,
      ...initialPreferences,
    },
  })

  // Load initial preferences
  useEffect(() => {
    if (initialPreferences) {
      reset({
        theme: 'system',
        language: 'en',
        date_format: 'MM/dd/yyyy',
        time_format: '12h',
        email_notifications_enabled: true,
        email_frequency: 'immediate',
        email_digest: true,
        notify_security_alerts: true,
        notify_account_updates: true,
        notify_organization_updates: true,
        notify_project_updates: true,
        notify_mentions: true,
        notify_comments: true,
        notify_invitations: true,
        notify_billing_alerts: true,
        notify_feature_announcements: false,
        browser_notifications_enabled: false,
        desktop_notifications_enabled: false,
        mobile_notifications_enabled: false,
        marketing_emails: false,
        product_updates: true,
        newsletters: false,
        surveys: false,
        profile_visibility: 'organization',
        email_visibility: 'organization',
        activity_visibility: 'organization',
        hide_last_seen: false,
        hide_activity_status: false,
        quiet_hours_enabled: false,
        quiet_hours_start: '22:00',
        quiet_hours_end: '08:00',
        timezone_aware: true,
        reduce_motion: false,
        high_contrast: false,
        screen_reader_optimized: false,
        data_retention_period: 365,
        auto_delete_inactive: false,
        ...initialPreferences,
      })
    }
  }, [initialPreferences, reset])

  const onSubmit = async (data: UserPreferencesData) => {
    if (!onSave) return

    setLoading(true)
    setError(null)
    setSuccess(false)

    try {
      const result = await onSave(data)

      if (result.success) {
        setSuccess(true)
        onSuccess?.()
        
        // Reset success message after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      } else {
        setError(result.error || 'Failed to save preferences')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const sections = [
    {
      id: 'theme' as const,
      name: 'Theme & Display',
      icon: PaintBrushIcon,
      description: 'Customize how the app looks and feels',
    },
    {
      id: 'notifications' as const,
      name: 'Notifications',
      icon: BellIcon,
      description: 'Control when and how you receive notifications',
    },
    {
      id: 'privacy' as const,
      name: 'Privacy',
      icon: EyeIcon,
      description: 'Manage your privacy and visibility settings',
    },
    {
      id: 'accessibility' as const,
      name: 'Accessibility',
      icon: ShieldCheckIcon,
      description: 'Options to improve accessibility',
    },
    {
      id: 'data' as const,
      name: 'Data & Storage',
      icon: GlobeAltIcon,
      description: 'Control how your data is stored and managed',
    },
  ]

  const watchedValues = watch()

  return (
    <div className={`max-w-4xl mx-auto ${className}`} data-testid="preferences-form">
      {/* Error/Success Messages */}
      {error && (
        <Alert type="error" onClose={() => setError(null)} className="mb-6" data-testid="preferences-save-error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert type="success" onClose={() => setSuccess(false)} className="mb-6" data-testid="preferences-save-success">
          Preferences updated successfully!
        </Alert>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-x-5">
        {/* Navigation Sidebar */}
        <aside className="py-6 px-2 sm:px-6 lg:py-0 lg:px-0 lg:col-span-3">
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full group rounded-md px-3 py-2 flex items-center text-sm font-medium transition-colors ${
                    activeSection === section.id
                      ? 'bg-gray-50 text-orange-700 hover:text-orange-700'
                      : 'text-gray-900 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                  aria-current={activeSection === section.id ? 'page' : undefined}
                  data-testid={`${section.id}-tab`}
                >
                  <Icon
                    className={`flex-shrink-0 -ml-1 mr-3 h-5 w-5 ${
                      activeSection === section.id
                        ? 'text-orange-500'
                        : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="truncate">{section.name}</span>
                </button>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <div className="space-y-6 sm:px-6 lg:px-0 lg:col-span-9">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Theme & Display Section */}
            {activeSection === 'theme' && (
              <div className="shadow sm:rounded-md sm:overflow-hidden" data-testid="theme-section">
                <div className="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Theme & Display</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Customize how the app looks and feels to match your preferences.
                    </p>
                  </div>

                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                    {/* Theme Selection */}
                    <div className="sm:col-span-3">
                      <label htmlFor="theme" className="block text-sm font-medium text-gray-700">
                        Theme
                      </label>
                      <select
                        id="theme"
                        {...register('theme')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        data-testid="theme-select"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="system">System (Auto)</option>
                      </select>
                      {errors.theme && (
                        <p className="mt-1 text-sm text-red-600">{errors.theme.message}</p>
                      )}
                    </div>

                    {/* Language */}
                    <div className="sm:col-span-3">
                      <label htmlFor="language" className="block text-sm font-medium text-gray-700">
                        Language
                      </label>
                      <select
                        id="language"
                        {...register('language')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        data-testid="language-select"
                      >
                        <option value="en">English</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="it">Italiano</option>
                        <option value="pt">Português</option>
                        <option value="ja">日本語</option>
                        <option value="zh">中文</option>
                      </select>
                    </div>

                    {/* Date Format */}
                    <div className="sm:col-span-3">
                      <label htmlFor="date_format" className="block text-sm font-medium text-gray-700">
                        Date Format
                      </label>
                      <select
                        id="date_format"
                        {...register('date_format')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        data-testid="date-format-select"
                      >
                        <option value="MM/dd/yyyy">MM/DD/YYYY (US)</option>
                        <option value="dd/MM/yyyy">DD/MM/YYYY (EU)</option>
                        <option value="yyyy-MM-dd">YYYY-MM-DD (ISO)</option>
                      </select>
                    </div>

                    {/* Time Format */}
                    <div className="sm:col-span-3">
                      <label htmlFor="time_format" className="block text-sm font-medium text-gray-700">
                        Time Format
                      </label>
                      <select
                        id="time_format"
                        {...register('time_format')}
                        className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                        data-testid="time-format-select"
                      >
                        <option value="12h">12 Hour (AM/PM)</option>
                        <option value="24h">24 Hour</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="shadow sm:rounded-md sm:overflow-hidden" data-testid="notifications-section">
                <div className="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Notifications</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Control when and how you receive notifications.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Email Notifications */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Enable email notifications</span>
                          <Switch
                            checked={watchedValues.email_notifications_enabled}
                            onChange={(checked) => setValue('email_notifications_enabled', checked)}
                            data-testid="email-notifications-toggle"
                          />
                        </div>

                        {watchedValues.email_notifications_enabled && (
                          <>
                            <div>
                              <label htmlFor="email_frequency" className="block text-sm font-medium text-gray-700">
                                Email Frequency
                              </label>
                              <select
                                id="email_frequency"
                                {...register('email_frequency')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                data-testid="email-frequency-select"
                              >
                                <option value="immediate">Immediate</option>
                                <option value="hourly">Hourly digest</option>
                                <option value="daily">Daily digest</option>
                                <option value="weekly">Weekly digest</option>
                              </select>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-sm text-gray-700">Send email digest summary</span>
                              <Switch
                                checked={watchedValues.email_digest}
                                onChange={(checked) => setValue('email_digest', checked)}
                              />
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Notification Types */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Notification Types</h3>
                      <div className="mt-4 space-y-3">
                        {[
                          { key: 'notify_security_alerts', label: 'Security alerts', description: 'Login attempts, password changes' },
                          { key: 'notify_account_updates', label: 'Account updates', description: 'Profile changes, settings updates' },
                          { key: 'notify_organization_updates', label: 'Organization updates', description: 'Team changes, role updates' },
                          { key: 'notify_project_updates', label: 'Project updates', description: 'Project changes and milestones' },
                          { key: 'notify_mentions', label: 'Mentions', description: 'When someone mentions you' },
                          { key: 'notify_comments', label: 'Comments', description: 'New comments on your content' },
                          { key: 'notify_invitations', label: 'Invitations', description: 'Team and organization invites' },
                          { key: 'notify_billing_alerts', label: 'Billing alerts', description: 'Payment and subscription updates' },
                          { key: 'notify_feature_announcements', label: 'Feature announcements', description: 'New features and updates' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-sm text-gray-900">{item.label}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <Switch
                              checked={watchedValues[item.key as keyof UserPreferencesData] as boolean}
                              onChange={(checked) => setValue(item.key as keyof UserPreferencesData, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Marketing Communications */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Marketing Communications</h3>
                      <div className="mt-4 space-y-3">
                        {[
                          { key: 'marketing_emails', label: 'Marketing emails', description: 'Promotional offers and campaigns' },
                          { key: 'product_updates', label: 'Product updates', description: 'New features and improvements' },
                          { key: 'newsletters', label: 'Newsletters', description: 'Company news and insights' },
                          { key: 'surveys', label: 'Surveys', description: 'Feedback requests and surveys' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between">
                            <div className="flex-1">
                              <span className="text-sm text-gray-900">{item.label}</span>
                              <p className="text-xs text-gray-500">{item.description}</p>
                            </div>
                            <Switch
                              checked={watchedValues[item.key as keyof UserPreferencesData] as boolean}
                              onChange={(checked) => setValue(item.key as keyof UserPreferencesData, checked)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quiet Hours */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Quiet Hours</h3>
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-700">Enable quiet hours</span>
                          <Switch
                            checked={watchedValues.quiet_hours_enabled}
                            onChange={(checked) => setValue('quiet_hours_enabled', checked)}
                            data-testid="quiet-hours-toggle"
                          />
                        </div>

                        {watchedValues.quiet_hours_enabled && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label htmlFor="quiet_hours_start" className="block text-sm font-medium text-gray-700">
                                Start Time
                              </label>
                              <input
                                type="time"
                                id="quiet_hours_start"
                                {...register('quiet_hours_start')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                data-testid="quiet-hours-start"
                              />
                            </div>
                            <div>
                              <label htmlFor="quiet_hours_end" className="block text-sm font-medium text-gray-700">
                                End Time
                              </label>
                              <input
                                type="time"
                                id="quiet_hours_end"
                                {...register('quiet_hours_end')}
                                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                                data-testid="quiet-hours-end"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Section */}
            {activeSection === 'privacy' && (
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Privacy</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Control who can see your information and activity.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    {/* Visibility Settings */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Profile Visibility</h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="profile_visibility" className="block text-sm font-medium text-gray-700">
                            Who can see your profile
                          </label>
                          <select
                            id="profile_visibility"
                            {...register('profile_visibility')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                            data-testid="profile-visibility-select"
                          >
                            <option value="public">Everyone</option>
                            <option value="organization">Organization members only</option>
                            <option value="private">Only me</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="email_visibility" className="block text-sm font-medium text-gray-700">
                            Who can see your email
                          </label>
                          <select
                            id="email_visibility"
                            {...register('email_visibility')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          >
                            <option value="public">Everyone</option>
                            <option value="organization">Organization members only</option>
                            <option value="private">Only me</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="activity_visibility" className="block text-sm font-medium text-gray-700">
                            Who can see your activity
                          </label>
                          <select
                            id="activity_visibility"
                            {...register('activity_visibility')}
                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          >
                            <option value="public">Everyone</option>
                            <option value="organization">Organization members only</option>
                            <option value="private">Only me</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Activity Privacy */}
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">Activity Privacy</h3>
                      <div className="mt-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">Hide last seen</span>
                            <p className="text-xs text-gray-500">Don't show when you were last active</p>
                          </div>
                          <Switch
                            checked={watchedValues.hide_last_seen}
                            onChange={(checked) => setValue('hide_last_seen', checked)}
                          />
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <span className="text-sm text-gray-900">Hide activity status</span>
                            <p className="text-xs text-gray-500">Don't show your online/offline status</p>
                          </div>
                          <Switch
                            checked={watchedValues.hide_activity_status}
                            onChange={(checked) => setValue('hide_activity_status', checked)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Accessibility Section */}
            {activeSection === 'accessibility' && (
              <div className="shadow sm:rounded-md sm:overflow-hidden">
                <div className="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Accessibility</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Options to improve accessibility and usability.
                    </p>
                  </div>

                  <div className="mt-6 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">Reduce motion</span>
                        <p className="text-xs text-gray-500">Minimize animations and transitions</p>
                      </div>
                      <Switch
                        checked={watchedValues.reduce_motion}
                        onChange={(checked) => setValue('reduce_motion', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">High contrast</span>
                        <p className="text-xs text-gray-500">Use higher contrast colors for better visibility</p>
                      </div>
                      <Switch
                        checked={watchedValues.high_contrast}
                        onChange={(checked) => setValue('high_contrast', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">Screen reader optimized</span>
                        <p className="text-xs text-gray-500">Optimize interface for screen readers</p>
                      </div>
                      <Switch
                        checked={watchedValues.screen_reader_optimized}
                        onChange={(checked) => setValue('screen_reader_optimized', checked)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Data & Storage Section */}
            {activeSection === 'data' && (
              <div className="shadow sm:rounded-md sm:overflow-hidden" data-testid="data-storage-section">
                <div className="bg-white py-6 px-4 sm:p-6">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900">Data & Storage</h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Control how your data is stored and managed.
                    </p>
                  </div>

                  <div className="mt-6 space-y-6">
                    <div>
                      <label htmlFor="data_retention_period" className="block text-sm font-medium text-gray-700">
                        Data retention period (days)
                      </label>
                      <div className="mt-1">
                        <input
                          type="number"
                          id="data_retention_period"
                          min="30"
                          max="2555"
                          {...register('data_retention_period', { valueAsNumber: true })}
                          className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-orange-500 focus:border-orange-500 sm:text-sm"
                          data-testid="data-retention-period"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          How long to keep your activity data (30 days to 7 years)
                        </p>
                      </div>
                      {errors.data_retention_period && (
                        <p className="mt-1 text-sm text-red-600">{errors.data_retention_period.message}</p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-sm text-gray-900">Auto-delete inactive data</span>
                        <p className="text-xs text-gray-500">Automatically delete data after retention period</p>
                      </div>
                      <Switch
                        checked={watchedValues.auto_delete_inactive}
                        onChange={(checked) => setValue('auto_delete_inactive', checked)}
                        data-testid="auto-delete-inactive-toggle"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="pt-5">
              <div className="flex justify-end">
                <Button
                  type="submit"
                  loading={loading}
                  disabled={!isDirty || loading}
                  data-testid="save-preferences-button"
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}