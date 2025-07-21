'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@next-saas/multi-tenant'
import { createSupabaseBrowserClient } from '@nextsaas/supabase'
import type { SSOConfiguration, SSOTestResult } from '../types/sso'
import { SAMLHandler } from '../lib/saml-handler'

export function useSSO() {
  const { currentOrganization: organization } = useOrganization()
  const [configurations, setConfigurations] = useState<SSOConfiguration[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const fetchConfigurations = useCallback(async () => {
    if (!organization?.id) {
      setConfigurations([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('sso_configurations')
        .select('*')
        .eq('organization_id', organization.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      setConfigurations(data || [])
    } catch (err) {
      console.error('Error fetching SSO configurations:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch SSO configurations')
    } finally {
      setIsLoading(false)
    }
  }, [organization?.id, supabase])

  useEffect(() => {
    fetchConfigurations()
  }, [fetchConfigurations])

  const saveConfiguration = useCallback(async (config: Partial<SSOConfiguration>) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const configData = {
        ...config,
        organization_id: organization.id,
        updated_at: new Date().toISOString(),
      }

      let result
      if (config.id) {
        // Update existing configuration
        const { data, error } = await supabase
          .from('sso_configurations')
          .update(configData)
          .eq('id', config.id)
          .eq('organization_id', organization.id)
          .select()
          .single()

        if (error) throw error
        result = data
      } else {
        // Create new configuration
        const { data, error } = await supabase
          .from('sso_configurations')
          .insert({
            ...configData,
            created_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) throw error
        result = data
      }

      // Update local state
      setConfigurations(prev => {
        if (config.id) {
          return prev.map(c => c.id === config.id ? result : c)
        } else {
          return [result, ...prev]
        }
      })

      return result
    } catch (err) {
      console.error('Error saving SSO configuration:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const deleteConfiguration = useCallback(async (configId: string) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      const { error } = await supabase
        .from('sso_configurations')
        .delete()
        .eq('id', configId)
        .eq('organization_id', organization.id)

      if (error) throw error

      // Update local state
      setConfigurations(prev => prev.filter(c => c.id !== configId))
    } catch (err) {
      console.error('Error deleting SSO configuration:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const toggleConfiguration = useCallback(async (configId: string, isActive: boolean) => {
    if (!organization?.id) {
      throw new Error('No organization selected')
    }

    try {
      // If activating this config, deactivate all others
      if (isActive) {
        await supabase
          .from('sso_configurations')
          .update({ is_active: false })
          .eq('organization_id', organization.id)
          .neq('id', configId)
      }

      const { data, error } = await supabase
        .from('sso_configurations')
        .update({ 
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq('id', configId)
        .eq('organization_id', organization.id)
        .select()
        .single()

      if (error) throw error

      // Update local state
      setConfigurations(prev => 
        prev.map(c => ({
          ...c,
          is_active: c.id === configId ? isActive : (isActive ? false : c.is_active)
        }))
      )

      return data
    } catch (err) {
      console.error('Error toggling SSO configuration:', err)
      throw err
    }
  }, [organization?.id, supabase])

  const testConfiguration = useCallback(async (config: SSOConfiguration): Promise<SSOTestResult> => {
    try {
      const handler = new SAMLHandler()
      const testResult = await handler.testConfiguration(config)
      
      return {
        success: testResult.success,
        message: testResult.success 
          ? 'Configuration test passed successfully'
          : 'Configuration test failed',
        details: {
          connection_test: testResult.success,
          metadata_valid: testResult.errors.length === 0,
          certificate_valid: !testResult.errors.some(e => e.includes('certificate')),
          attribute_mapping: !testResult.errors.some(e => e.includes('attribute')),
        },
        errors: testResult.errors,
      }
    } catch (err) {
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Test failed',
        errors: [err instanceof Error ? err.message : 'Unknown error'],
      }
    }
  }, [])

  const getActiveConfiguration = useCallback(() => {
    return configurations.find(c => c.is_active) || null
  }, [configurations])

  const generateLoginUrl = useCallback((config: SSOConfiguration, callbackUrl: string) => {
    try {
      const handler = new SAMLHandler()
      return handler.generateAuthnRequest(config, callbackUrl)
    } catch (err) {
      console.error('Error generating login URL:', err)
      throw err
    }
  }, [])

  return {
    configurations,
    isLoading,
    error,
    saveConfiguration,
    deleteConfiguration,
    toggleConfiguration,
    testConfiguration,
    getActiveConfiguration,
    generateLoginUrl,
    refetch: fetchConfigurations,
  }
}

export function useSSOCallback() {
  const { currentOrganization: organization } = useOrganization()
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createSupabaseBrowserClient()

  const processSAMLCallback = useCallback(async (samlResponse: string, relayState?: string) => {
    if (!organization?.id) {
      throw new Error('No organization context')
    }

    try {
      setIsProcessing(true)
      setError(null)

      // Get active SSO configuration for the organization
      const { data: config, error: configError } = await supabase
        .from('sso_configurations')
        .select('*')
        .eq('organization_id', organization.id)
        .eq('is_active', true)
        .single()

      if (configError || !config) {
        throw new Error('No active SSO configuration found')
      }

      // Validate SAML response
      const handler = new SAMLHandler()
      const assertion = await handler.validateSAMLResponse(samlResponse, config)

      // Extract user information from assertion
      const userInfo = {
        email: assertion.attributes.email as string,
        firstName: assertion.attributes.first_name as string,
        lastName: assertion.attributes.last_name as string,
        displayName: assertion.attributes.display_name as string,
        groups: assertion.attributes.groups as string | string[],
      }

      if (!userInfo.email) {
        throw new Error('Email not provided in SAML assertion')
      }

      return {
        userInfo,
        sessionIndex: assertion.sessionIndex,
        nameId: assertion.nameId,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'SAML callback processing failed'
      setError(errorMessage)
      console.error('SAML callback error:', err)
      throw new Error(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }, [organization?.id, supabase])

  return {
    processSAMLCallback,
    isProcessing,
    error,
  }
}