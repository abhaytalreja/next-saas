'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Button,
  Input,
  Label,
  Textarea,
  Switch,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Badge,
  Alert,
  AlertDescription,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Spinner,
} from '@nextsaas/ui'
import { useOrganization } from '@next-saas/multi-tenant'
import type { SecurityPolicy, SecurityPolicyConfig } from '../types/sso'

const ipWhitelistSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  allowed_ips: z.array(z.string().ip('Invalid IP address')).min(1, 'At least one IP is required'),
  allowed_countries: z.array(z.string()).optional(),
  block_vpn: z.boolean().default(false),
  is_active: z.boolean().default(true),
})

const mfaEnforcementSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  require_mfa: z.boolean().default(true),
  mfa_methods: z.array(z.enum(['totp', 'sms', 'email', 'webauthn'])).min(1),
  mfa_grace_period_hours: z.number().min(0).max(168).optional(),
  is_active: z.boolean().default(true),
})

const sessionTimeoutSchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  idle_timeout_minutes: z.number().min(1).max(1440).optional(),
  absolute_timeout_hours: z.number().min(1).max(168).optional(),
  concurrent_sessions_limit: z.number().min(1).max(50).optional(),
  is_active: z.boolean().default(true),
})

const passwordPolicySchema = z.object({
  name: z.string().min(1, 'Policy name is required'),
  description: z.string().optional(),
  min_length: z.number().min(6).max(128).default(8),
  require_uppercase: z.boolean().default(true),
  require_lowercase: z.boolean().default(true),
  require_numbers: z.boolean().default(true),
  require_symbols: z.boolean().default(false),
  prevent_reuse_count: z.number().min(0).max(24).default(5),
  max_age_days: z.number().min(1).max(365).optional(),
  is_active: z.boolean().default(true),
})

type IPWhitelistFormData = z.infer<typeof ipWhitelistSchema>
type MFAEnforcementFormData = z.infer<typeof mfaEnforcementSchema>
type SessionTimeoutFormData = z.infer<typeof sessionTimeoutSchema>
type PasswordPolicyFormData = z.infer<typeof passwordPolicySchema>

interface SecurityPolicyManagerProps {
  policies: SecurityPolicy[]
  onSave: (policy: Partial<SecurityPolicy>) => Promise<void>
  onDelete: (policyId: string) => Promise<void>
  onToggle: (policyId: string, active: boolean) => Promise<void>
}

export function SecurityPolicyManager({ policies, onSave, onDelete, onToggle }: SecurityPolicyManagerProps) {
  const { organization } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('ip_whitelist')
  const [newIpInput, setNewIpInput] = useState('')
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])

  // Group policies by type
  const policyGroups = {
    ip_whitelist: policies.filter(p => p.policy_type === 'ip_whitelist'),
    mfa_enforcement: policies.filter(p => p.policy_type === 'mfa_enforcement'),
    session_timeout: policies.filter(p => p.policy_type === 'session_timeout'),
    password_policy: policies.filter(p => p.policy_type === 'password_policy'),
  }

  // IP Whitelist Form
  const ipWhitelistForm = useForm<IPWhitelistFormData>({
    resolver: zodResolver(ipWhitelistSchema),
    defaultValues: {
      name: '',
      description: '',
      allowed_ips: [],
      allowed_countries: [],
      block_vpn: false,
      is_active: true,
    },
  })

  // MFA Enforcement Form
  const mfaForm = useForm<MFAEnforcementFormData>({
    resolver: zodResolver(mfaEnforcementSchema),
    defaultValues: {
      name: 'Require Multi-Factor Authentication',
      description: 'Require all users to enable MFA',
      require_mfa: true,
      mfa_methods: ['totp'],
      mfa_grace_period_hours: 24,
      is_active: true,
    },
  })

  // Session Timeout Form
  const sessionForm = useForm<SessionTimeoutFormData>({
    resolver: zodResolver(sessionTimeoutSchema),
    defaultValues: {
      name: 'Session Timeout Policy',
      description: 'Automatically log out inactive users',
      idle_timeout_minutes: 60,
      absolute_timeout_hours: 8,
      concurrent_sessions_limit: 5,
      is_active: true,
    },
  })

  // Password Policy Form
  const passwordForm = useForm<PasswordPolicyFormData>({
    resolver: zodResolver(passwordPolicySchema),
    defaultValues: {
      name: 'Password Requirements',
      description: 'Enforce strong password requirements',
      min_length: 8,
      require_uppercase: true,
      require_lowercase: true,
      require_numbers: true,
      require_symbols: false,
      prevent_reuse_count: 5,
      is_active: true,
    },
  })

  const addIpAddress = () => {
    if (!newIpInput.trim()) return

    const currentIps = ipWhitelistForm.getValues('allowed_ips')
    ipWhitelistForm.setValue('allowed_ips', [...currentIps, newIpInput.trim()])
    setNewIpInput('')
  }

  const removeIpAddress = (index: number) => {
    const currentIps = ipWhitelistForm.getValues('allowed_ips')
    ipWhitelistForm.setValue('allowed_ips', currentIps.filter((_, i) => i !== index))
  }

  const onSubmitIPWhitelist = async (data: IPWhitelistFormData) => {
    if (!organization) return

    setIsLoading(true)
    try {
      const policy: Partial<SecurityPolicy> = {
        organization_id: organization.id,
        name: data.name,
        description: data.description,
        policy_type: 'ip_whitelist',
        configuration: {
          allowed_ips: data.allowed_ips,
          allowed_countries: data.allowed_countries,
          block_vpn: data.block_vpn,
        },
        is_active: data.is_active,
      }

      await onSave(policy)
      ipWhitelistForm.reset()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitMFA = async (data: MFAEnforcementFormData) => {
    if (!organization) return

    setIsLoading(true)
    try {
      const policy: Partial<SecurityPolicy> = {
        organization_id: organization.id,
        name: data.name,
        description: data.description,
        policy_type: 'mfa_enforcement',
        configuration: {
          require_mfa: data.require_mfa,
          mfa_methods: data.mfa_methods,
          mfa_grace_period_hours: data.mfa_grace_period_hours,
        },
        is_active: data.is_active,
      }

      await onSave(policy)
      mfaForm.reset()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitSession = async (data: SessionTimeoutFormData) => {
    if (!organization) return

    setIsLoading(true)
    try {
      const policy: Partial<SecurityPolicy> = {
        organization_id: organization.id,
        name: data.name,
        description: data.description,
        policy_type: 'session_timeout',
        configuration: {
          idle_timeout_minutes: data.idle_timeout_minutes,
          absolute_timeout_hours: data.absolute_timeout_hours,
          concurrent_sessions_limit: data.concurrent_sessions_limit,
        },
        is_active: data.is_active,
      }

      await onSave(policy)
      sessionForm.reset()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitPassword = async (data: PasswordPolicyFormData) => {
    if (!organization) return

    setIsLoading(true)
    try {
      const policy: Partial<SecurityPolicy> = {
        organization_id: organization.id,
        name: data.name,
        description: data.description,
        policy_type: 'password_policy',
        configuration: {
          min_length: data.min_length,
          require_uppercase: data.require_uppercase,
          require_lowercase: data.require_lowercase,
          require_numbers: data.require_numbers,
          require_symbols: data.require_symbols,
          prevent_reuse_count: data.prevent_reuse_count,
          max_age_days: data.max_age_days,
        },
        is_active: data.is_active,
      }

      await onSave(policy)
      passwordForm.reset()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Security Policies</h2>
        <p className="text-muted-foreground">
          Configure security policies to protect your organization
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="ip_whitelist">IP Whitelist</TabsTrigger>
          <TabsTrigger value="mfa_enforcement">MFA Policy</TabsTrigger>
          <TabsTrigger value="session_timeout">Session Timeout</TabsTrigger>
          <TabsTrigger value="password_policy">Password Policy</TabsTrigger>
        </TabsList>

        {/* IP Whitelist Tab */}
        <TabsContent value="ip_whitelist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>IP Address Whitelist</CardTitle>
              <CardDescription>
                Restrict access to specific IP addresses or countries
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={ipWhitelistForm.handleSubmit(onSubmitIPWhitelist)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ip_name">Policy Name</Label>
                    <Input
                      id="ip_name"
                      {...ipWhitelistForm.register('name')}
                      placeholder="e.g., Office IP Whitelist"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ip_active" className="flex items-center space-x-2">
                      <span>Active</span>
                      <Switch {...ipWhitelistForm.register('is_active')} />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="ip_description">Description</Label>
                  <Textarea
                    id="ip_description"
                    {...ipWhitelistForm.register('description')}
                    placeholder="Describe this policy..."
                  />
                </div>

                <div className="space-y-2">
                  <Label>Allowed IP Addresses</Label>
                  <div className="flex space-x-2">
                    <Input
                      value={newIpInput}
                      onChange={(e) => setNewIpInput(e.target.value)}
                      placeholder="Enter IP address or CIDR (e.g., 192.168.1.0/24)"
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIpAddress())}
                    />
                    <Button type="button" onClick={addIpAddress}>Add</Button>
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {ipWhitelistForm.watch('allowed_ips').map((ip, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                        <span>{ip}</span>
                        <button
                          type="button"
                          onClick={() => removeIpAddress(index)}
                          className="ml-1 text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center space-x-2">
                    <span>Block VPN/Proxy Access</span>
                    <Switch {...ipWhitelistForm.register('block_vpn')} />
                  </Label>
                  <p className="text-sm text-gray-500">
                    Block access from known VPN and proxy services
                  </p>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner className="w-4 h-4 mr-2" />}
                  Create IP Whitelist Policy
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Existing IP Policies */}
          {policyGroups.ip_whitelist.map((policy) => (
            <Card key={policy.id}>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{policy.name}</CardTitle>
                  {policy.description && (
                    <CardDescription>{policy.description}</CardDescription>
                  )}
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={policy.is_active}
                    onCheckedChange={(checked) => onToggle(policy.id, checked)}
                  />
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => onDelete(policy.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Allowed IPs:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {policy.configuration.allowed_ips?.map((ip, index) => (
                        <Badge key={index} variant="outline">{ip}</Badge>
                      ))}
                    </div>
                  </div>
                  {policy.configuration.block_vpn && (
                    <Badge variant="secondary">VPN/Proxy Blocking Enabled</Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* MFA Enforcement Tab */}
        <TabsContent value="mfa_enforcement" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Multi-Factor Authentication</CardTitle>
              <CardDescription>
                Require users to enable multi-factor authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={mfaForm.handleSubmit(onSubmitMFA)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mfa_name">Policy Name</Label>
                    <Input
                      id="mfa_name"
                      {...mfaForm.register('name')}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="mfa_active" className="flex items-center space-x-2">
                      <span>Active</span>
                      <Switch {...mfaForm.register('is_active')} />
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Grace Period (hours)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="168"
                    {...mfaForm.register('mfa_grace_period_hours', { valueAsNumber: true })}
                  />
                  <p className="text-sm text-gray-500">
                    Allow users this many hours to set up MFA after first login
                  </p>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner className="w-4 h-4 mr-2" />}
                  Create MFA Policy
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Session Timeout Tab */}
        <TabsContent value="session_timeout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Timeout</CardTitle>
              <CardDescription>
                Configure automatic logout policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={sessionForm.handleSubmit(onSubmitSession)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Idle Timeout (minutes)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="1440"
                      {...sessionForm.register('idle_timeout_minutes', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Maximum Session (hours)</Label>
                    <Input
                      type="number"
                      min="1"
                      max="168"
                      {...sessionForm.register('absolute_timeout_hours', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner className="w-4 h-4 mr-2" />}
                  Create Session Policy
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Password Policy Tab */}
        <TabsContent value="password_policy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Password Requirements</CardTitle>
              <CardDescription>
                Set password complexity requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Length</Label>
                    <Input
                      type="number"
                      min="6"
                      max="128"
                      {...passwordForm.register('min_length', { valueAsNumber: true })}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Prevent Reuse (count)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="24"
                      {...passwordForm.register('prevent_reuse_count', { valueAsNumber: true })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Label className="flex items-center space-x-2">
                    <Switch {...passwordForm.register('require_uppercase')} />
                    <span>Require Uppercase</span>
                  </Label>
                  
                  <Label className="flex items-center space-x-2">
                    <Switch {...passwordForm.register('require_lowercase')} />
                    <span>Require Lowercase</span>
                  </Label>
                  
                  <Label className="flex items-center space-x-2">
                    <Switch {...passwordForm.register('require_numbers')} />
                    <span>Require Numbers</span>
                  </Label>
                  
                  <Label className="flex items-center space-x-2">
                    <Switch {...passwordForm.register('require_symbols')} />
                    <span>Require Symbols</span>
                  </Label>
                </div>

                <Button type="submit" disabled={isLoading}>
                  {isLoading && <Spinner className="w-4 h-4 mr-2" />}
                  Create Password Policy
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}