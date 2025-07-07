import { Switch } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [enabled, setEnabled] = useState(false)

  return (
    <Switch
      checked={enabled}
      onChange={setEnabled}
      label="Enable notifications"
    />
  )
}

const SizesExample = () => {
  const [states, setStates] = useState({
    sm: false,
    md: true,
    lg: false,
  })

  const updateState = (key: string, value: boolean) => {
    setStates(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <Switch
        size="sm"
        checked={states.sm}
        onChange={(value) => updateState('sm', value)}
        label="Small switch"
      />
      <Switch
        size="md"
        checked={states.md}
        onChange={(value) => updateState('md', value)}
        label="Medium switch (default)"
      />
      <Switch
        size="lg"
        checked={states.lg}
        onChange={(value) => updateState('lg', value)}
        label="Large switch"
      />
    </div>
  )
}

const DescriptionExample = () => {
  const [settings, setSettings] = useState({
    notifications: true,
    marketing: false,
    analytics: true,
  })

  const updateSetting = (key: string, value: boolean) => {
    setSettings(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      <Switch
        checked={settings.notifications}
        onChange={(value) => updateSetting('notifications', value)}
        label="Email Notifications"
        description="Receive email notifications for important updates"
      />
      <Switch
        checked={settings.marketing}
        onChange={(value) => updateSetting('marketing', value)}
        label="Marketing Communications"
        description="Get updates about new features and product announcements"
      />
      <Switch
        checked={settings.analytics}
        onChange={(value) => updateSetting('analytics', value)}
        label="Analytics & Performance"
        description="Help us improve by sharing anonymous usage data"
      />
    </div>
  )
}

const DisabledExample = () => {
  return (
    <div className="space-y-4">
      <Switch
        checked={false}
        disabled
        label="Disabled switch (off)"
        description="This setting cannot be changed"
      />
      <Switch
        checked={true}
        disabled
        label="Disabled switch (on)"
        description="This setting is permanently enabled"
      />
    </div>
  )
}

const VariantsExample = () => {
  const [variants, setVariants] = useState({
    default: true,
    success: false,
    warning: true,
    error: false,
  })

  const updateVariant = (key: string, value: boolean) => {
    setVariants(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-4">
      <Switch
        variant="default"
        checked={variants.default}
        onChange={(value) => updateVariant('default', value)}
        label="Default variant"
      />
      <Switch
        variant="success"
        checked={variants.success}
        onChange={(value) => updateVariant('success', value)}
        label="Success variant"
      />
      <Switch
        variant="warning"
        checked={variants.warning}
        onChange={(value) => updateVariant('warning', value)}
        label="Warning variant"
      />
      <Switch
        variant="error"
        checked={variants.error}
        onChange={(value) => updateVariant('error', value)}
        label="Error variant"
      />
    </div>
  )
}

const GroupExample = () => {
  const [preferences, setPreferences] = useState({
    darkMode: false,
    compactView: true,
    autoSave: true,
    showPreview: false,
    enableShortcuts: true,
  })

  const updatePreference = (key: string, value: boolean) => {
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Application Preferences</h3>
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Appearance</h4>
          <div className="space-y-3">
            <Switch
              checked={preferences.darkMode}
              onChange={(value) => updatePreference('darkMode', value)}
              label="Dark Mode"
              description="Use dark theme across the application"
            />
            <Switch
              checked={preferences.compactView}
              onChange={(value) => updatePreference('compactView', value)}
              label="Compact View"
              description="Show more content in less space"
            />
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Functionality</h4>
          <div className="space-y-3">
            <Switch
              checked={preferences.autoSave}
              onChange={(value) => updatePreference('autoSave', value)}
              label="Auto Save"
              description="Automatically save changes as you work"
            />
            <Switch
              checked={preferences.showPreview}
              onChange={(value) => updatePreference('showPreview', value)}
              label="Show Preview"
              description="Display live preview while editing"
            />
            <Switch
              checked={preferences.enableShortcuts}
              onChange={(value) => updatePreference('enableShortcuts', value)}
              label="Keyboard Shortcuts"
              description="Enable keyboard shortcuts for faster navigation"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

const examples = [
  {
    title: 'Basic Switch',
    code: `const [enabled, setEnabled] = useState(false)

<Switch
  checked={enabled}
  onChange={setEnabled}
  label="Enable notifications"
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Sizes',
    code: `const [states, setStates] = useState({
  sm: false,
  md: true,
  lg: false,
})

<div className="space-y-4">
  <Switch
    size="sm"
    checked={states.sm}
    onChange={(value) => updateState('sm', value)}
    label="Small switch"
  />
  <Switch
    size="md"
    checked={states.md}
    onChange={(value) => updateState('md', value)}
    label="Medium switch (default)"
  />
  <Switch
    size="lg"
    checked={states.lg}
    onChange={(value) => updateState('lg', value)}
    label="Large switch"
  />
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'With Descriptions',
    code: `const [settings, setSettings] = useState({
  notifications: true,
  marketing: false,
})

<Switch
  checked={settings.notifications}
  onChange={(value) => updateSetting('notifications', value)}
  label="Email Notifications"
  description="Receive email notifications for important updates"
/>`,
    component: <DescriptionExample />,
  },
  {
    title: 'Disabled States',
    code: `<div className="space-y-4">
  <Switch
    checked={false}
    disabled
    label="Disabled switch (off)"
    description="This setting cannot be changed"
  />
  <Switch
    checked={true}
    disabled
    label="Disabled switch (on)"
    description="This setting is permanently enabled"
  />
</div>`,
    component: <DisabledExample />,
  },
  {
    title: 'Switch Variants',
    code: `const [variants, setVariants] = useState({
  default: true,
  success: false,
  warning: true,
  error: false,
})

<div className="space-y-4">
  <Switch
    variant="default"
    checked={variants.default}
    onChange={(value) => updateVariant('default', value)}
    label="Default variant"
  />
  <Switch
    variant="success"
    checked={variants.success}
    onChange={(value) => updateVariant('success', value)}
    label="Success variant"
  />
  <Switch
    variant="warning"
    checked={variants.warning}
    onChange={(value) => updateVariant('warning', value)}
    label="Warning variant"
  />
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'Settings Group',
    code: `const [preferences, setPreferences] = useState({
  darkMode: false,
  compactView: true,
  autoSave: true,
})

<div className="space-y-6">
  <Switch
    checked={preferences.darkMode}
    onChange={(value) => updatePreference('darkMode', value)}
    label="Dark Mode"
    description="Use dark theme across the application"
  />
  <Switch
    checked={preferences.compactView}
    onChange={(value) => updatePreference('compactView', value)}
    label="Compact View"
    description="Show more content in less space"
  />
  <Switch
    checked={preferences.autoSave}
    onChange={(value) => updatePreference('autoSave', value)}
    label="Auto Save"
    description="Automatically save changes as you work"
  />
</div>`,
    component: <GroupExample />,
  },
]

export default function SwitchPage() {
  return (
    <ComponentLayout
      title="Switch"
      description="A toggle switch component for binary settings and preferences with support for labels, descriptions, and multiple variants."
      examples={examples}
    />
  )
}