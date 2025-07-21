'use client'

import { useState, useCallback } from 'react'
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
  Alert,
  AlertDescription,
  Badge,
  Spinner
} from '@nextsaas/ui'
import { useOrganization } from '@next-saas/multi-tenant'
import type { SSOConfiguration, SAMLMetadata, SSOTestResult } from '../types/sso'
import { SAMLHandler } from '../lib/saml-handler'

const ssoConfigSchema = z.object({
  provider_name: z.string().min(1, 'Provider name is required'),
  provider_type: z.literal('saml'),
  metadata_xml: z.string().min(1, 'SAML metadata is required'),
  entity_id: z.string().optional(),
  sso_url: z.string().url().optional(),
  certificate: z.string().optional(),
  is_active: z.boolean().default(false),
  attribute_mapping: z.object({
    email: z.string().min(1, 'Email attribute mapping is required'),
    first_name: z.string().optional(),
    last_name: z.string().optional(),
    display_name: z.string().optional(),
    groups: z.string().optional(),
  }),
})

type SSOConfigFormData = z.infer<typeof ssoConfigSchema>

interface SSOConfigFormProps {
  config?: SSOConfiguration
  onSave: (config: Partial<SSOConfiguration>) => Promise<void>
  onTest?: (config: SSOConfiguration) => Promise<SSOTestResult>
  onDelete?: (configId: string) => Promise<void>
}

export function SSOConfigForm({ config, onSave, onTest, onDelete }: SSOConfigFormProps) {
  const { organization } = useOrganization()
  const [isLoading, setIsLoading] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [testResult, setTestResult] = useState<SSOTestResult | null>(null)
  const [parsedMetadata, setParsedMetadata] = useState<SAMLMetadata | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<SSOConfigFormData>({
    resolver: zodResolver(ssoConfigSchema),
    defaultValues: {
      provider_name: config?.provider_name || '',
      provider_type: 'saml',
      metadata_xml: '',
      is_active: config?.is_active || false,
      attribute_mapping: {
        email: (config?.metadata as SAMLMetadata)?.attribute_mapping?.email || 
               'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress',
        first_name: (config?.metadata as SAMLMetadata)?.attribute_mapping?.first_name || 
                    'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/givenname',
        last_name: (config?.metadata as SAMLMetadata)?.attribute_mapping?.last_name || 
                   'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/surname',
        display_name: (config?.metadata as SAMLMetadata)?.attribute_mapping?.display_name || 
                      'http://schemas.microsoft.com/identity/claims/displayname',
        groups: (config?.metadata as SAMLMetadata)?.attribute_mapping?.groups || '',
      },
    },
  })

  const metadataXml = watch('metadata_xml')

  const parseMetadata = useCallback(async (xmlContent: string) => {
    if (!xmlContent.trim()) {
      setParsedMetadata(null)
      return
    }

    try {
      const handler = new SAMLHandler()
      const metadata = await handler.parseMetadata(xmlContent)
      
      setParsedMetadata(metadata)
      
      // Auto-fill form fields
      setValue('entity_id', metadata.entity_id)
      setValue('sso_url', metadata.sso_url)
      setValue('certificate', metadata.certificate.substring(0, 100) + '...')
      
      // Update attribute mapping with defaults
      setValue('attribute_mapping.email', metadata.attribute_mapping.email)
      if (metadata.attribute_mapping.first_name) {
        setValue('attribute_mapping.first_name', metadata.attribute_mapping.first_name)
      }
      if (metadata.attribute_mapping.last_name) {
        setValue('attribute_mapping.last_name', metadata.attribute_mapping.last_name)
      }
      if (metadata.attribute_mapping.display_name) {
        setValue('attribute_mapping.display_name', metadata.attribute_mapping.display_name)
      }
      
    } catch (error) {
      setParsedMetadata(null)
      console.error('Failed to parse metadata:', error)
    }
  }, [setValue])

  const handleMetadataUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      const content = e.target?.result as string
      setValue('metadata_xml', content)
      parseMetadata(content)
    }
    reader.readAsText(file)
  }, [setValue, parseMetadata])

  const handleTestConfiguration = async () => {
    if (!onTest || !organization || !parsedMetadata) return

    setIsTesting(true)
    setTestResult(null)

    try {
      const formData = watch()
      const testConfig: SSOConfiguration = {
        id: config?.id || 'test',
        organization_id: organization.id,
        provider_type: 'saml',
        provider_name: formData.provider_name,
        metadata: {
          ...parsedMetadata,
          attribute_mapping: formData.attribute_mapping,
        },
        is_active: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const result = await onTest(testConfig)
      setTestResult(result)
    } catch (error) {
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Test failed',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const onSubmit = async (data: SSOConfigFormData) => {
    if (!organization || !parsedMetadata) return

    setIsLoading(true)

    try {
      const configData: Partial<SSOConfiguration> = {
        provider_name: data.provider_name,
        provider_type: 'saml',
        metadata: {
          ...parsedMetadata,
          attribute_mapping: data.attribute_mapping,
        },
        is_active: data.is_active,
      }

      await onSave(configData)
    } catch (error) {
      console.error('Failed to save SSO configuration:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!config?.id || !onDelete) return
    
    if (confirm('Are you sure you want to delete this SSO configuration?')) {
      await onDelete(config.id)
    }
  }

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{config ? 'Edit' : 'Add'} SSO Configuration</CardTitle>
            <CardDescription>
              Configure SAML 2.0 single sign-on for your organization
            </CardDescription>
          </div>
          {config && (
            <Badge variant={config.is_active ? 'default' : 'secondary'}>
              {config.is_active ? 'Active' : 'Inactive'}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Provider Configuration */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Provider Configuration</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="provider_name">Provider Name</Label>
                <Input
                  id="provider_name"
                  {...register('provider_name')}
                  placeholder="e.g., Okta, Azure AD, OneLogin"
                />
                {errors.provider_name && (
                  <p className="text-sm text-red-600">{errors.provider_name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="is_active" className="flex items-center space-x-2">
                  <span>Active</span>
                  <Switch {...register('is_active')} />
                </Label>
                <p className="text-sm text-gray-500">
                  Enable this SSO configuration for user authentication
                </p>
              </div>
            </div>
          </div>

          {/* SAML Metadata */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">SAML Metadata</h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="metadata_file">Upload Metadata File</Label>
                <Input
                  id="metadata_file"
                  type="file"
                  accept=".xml,.txt"
                  onChange={handleMetadataUpload}
                  className="mt-1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Upload the SAML metadata XML file from your identity provider
                </p>
              </div>

              <div>
                <Label htmlFor="metadata_xml">Or Paste Metadata XML</Label>
                <Textarea
                  id="metadata_xml"
                  {...register('metadata_xml')}
                  placeholder="Paste your SAML metadata XML here..."
                  rows={8}
                  className="font-mono text-sm"
                  onBlur={(e) => parseMetadata(e.target.value)}
                />
                {errors.metadata_xml && (
                  <p className="text-sm text-red-600">{errors.metadata_xml.message}</p>
                )}
              </div>
            </div>

            {/* Parsed Metadata Display */}
            {parsedMetadata && (
              <Alert>
                <AlertDescription>
                  <div className="space-y-2">
                    <p className="font-medium text-green-600">✓ Metadata parsed successfully</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Entity ID:</span>
                        <p className="text-gray-600 break-all">{parsedMetadata.entity_id}</p>
                      </div>
                      <div>
                        <span className="font-medium">SSO URL:</span>
                        <p className="text-gray-600 break-all">{parsedMetadata.sso_url}</p>
                      </div>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Attribute Mapping */}
          {parsedMetadata && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Attribute Mapping</h3>
              <p className="text-sm text-gray-600">
                Map SAML attributes to user profile fields
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="attr_email">Email Attribute *</Label>
                  <Input
                    id="attr_email"
                    {...register('attribute_mapping.email')}
                    placeholder="Email attribute name"
                  />
                  {errors.attribute_mapping?.email && (
                    <p className="text-sm text-red-600">{errors.attribute_mapping.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attr_first_name">First Name Attribute</Label>
                  <Input
                    id="attr_first_name"
                    {...register('attribute_mapping.first_name')}
                    placeholder="First name attribute name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attr_last_name">Last Name Attribute</Label>
                  <Input
                    id="attr_last_name"
                    {...register('attribute_mapping.last_name')}
                    placeholder="Last name attribute name"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="attr_display_name">Display Name Attribute</Label>
                  <Input
                    id="attr_display_name"
                    {...register('attribute_mapping.display_name')}
                    placeholder="Display name attribute name"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="attr_groups">Groups Attribute</Label>
                  <Input
                    id="attr_groups"
                    {...register('attribute_mapping.groups')}
                    placeholder="Groups attribute name (optional)"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Test Results */}
          {testResult && (
            <Alert variant={testResult.success ? 'default' : 'destructive'}>
              <AlertDescription>
                <div className="space-y-2">
                  <p className="font-medium">
                    {testResult.success ? '✓ Configuration test passed' : '✗ Configuration test failed'}
                  </p>
                  <p>{testResult.message}</p>
                  {testResult.details && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Test Details:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {Object.entries(testResult.details).map(([key, value]) => (
                          <li key={key}>
                            {key.replace(/_/g, ' ')}: {value ? '✓' : '✗'}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {testResult.errors && testResult.errors.length > 0 && (
                    <div className="mt-2 text-sm">
                      <p className="font-medium">Errors:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {testResult.errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t">
            <div className="flex space-x-2">
              {parsedMetadata && onTest && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConfiguration}
                  disabled={isTesting}
                >
                  {isTesting && <Spinner className="w-4 h-4 mr-2" />}
                  Test Configuration
                </Button>
              )}
              
              {config && onDelete && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDelete}
                >
                  Delete
                </Button>
              )}
            </div>

            <div className="flex space-x-2">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !isDirty || !parsedMetadata}
              >
                {isLoading && <Spinner className="w-4 h-4 mr-2" />}
                {config ? 'Update' : 'Create'} Configuration
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}