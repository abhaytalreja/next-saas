'use client'

import React, { useState } from 'react'
import { cn } from '../../../lib/utils'
import { Button } from '../../../atoms/buttons/Button'
import { Input } from '../../../atoms/inputs/Input'
import { Textarea } from '../../atoms/inputs/Textarea'
import { Select } from '../../atoms/inputs/Select'
import { Label } from '../../../atoms/forms/Label'
import { Heading } from '../../../atoms/typography/Heading'
import { Text } from '../../../atoms/typography/Text'
import { Badge } from '../../../atoms/badges/Badge'

export interface EmailTemplate {
  id: string
  name: string
  description?: string
  category: 'transactional' | 'marketing' | 'system'
  industry?: string
  subject: string
  preheader?: string
  htmlContent: string
  textContent?: string
  variables: TemplateVariable[]
  status: 'draft' | 'active' | 'archived'
  createdAt: Date
  updatedAt: Date
}

export interface TemplateVariable {
  name: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'url' | 'email'
  description?: string
  defaultValue?: string
  required: boolean
}

export interface EmailTemplateEditorProps {
  template?: EmailTemplate
  onSave?: (
    template: Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => void
  onCancel?: () => void
  onPreview?: (template: Partial<EmailTemplate>) => void
  onTestSend?: (template: Partial<EmailTemplate>, testEmail: string) => void
  loading?: boolean
  className?: string
}

const categoryOptions = [
  { value: 'transactional', label: 'Transactional' },
  { value: 'marketing', label: 'Marketing' },
  { value: 'system', label: 'System' },
]

const industryOptions = [
  { value: 'saas', label: 'SaaS' },
  { value: 'ecommerce', label: 'E-commerce' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'finance', label: 'Finance' },
  { value: 'education', label: 'Education' },
  { value: 'nonprofit', label: 'Non-profit' },
  { value: 'other', label: 'Other' },
]

const variableTypeOptions = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'boolean', label: 'Boolean' },
  { value: 'date', label: 'Date' },
  { value: 'url', label: 'URL' },
  { value: 'email', label: 'Email' },
]

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({
  template,
  onSave,
  onCancel,
  onPreview,
  onTestSend,
  loading = false,
  className,
}) => {
  const [formData, setFormData] = useState<Partial<EmailTemplate>>({
    name: template?.name || '',
    description: template?.description || '',
    category: template?.category || 'transactional',
    industry: template?.industry || '',
    subject: template?.subject || '',
    preheader: template?.preheader || '',
    htmlContent: template?.htmlContent || '',
    textContent: template?.textContent || '',
    variables: template?.variables || [],
    status: template?.status || 'draft',
  })

  const [activeTab, setActiveTab] = useState<
    'content' | 'variables' | 'settings'
  >('content')
  const [testEmail, setTestEmail] = useState('')
  const [newVariable, setNewVariable] = useState<Partial<TemplateVariable>>({
    name: '',
    type: 'text',
    description: '',
    defaultValue: '',
    required: false,
  })

  const handleInputChange = (field: keyof EmailTemplate, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleAddVariable = () => {
    if (!newVariable.name) return

    const variable: TemplateVariable = {
      name: newVariable.name!,
      type: newVariable.type || 'text',
      description: newVariable.description || '',
      defaultValue: newVariable.defaultValue || '',
      required: newVariable.required || false,
    }

    setFormData(prev => ({
      ...prev,
      variables: [...(prev.variables || []), variable],
    }))

    setNewVariable({
      name: '',
      type: 'text',
      description: '',
      defaultValue: '',
      required: false,
    })
  }

  const handleRemoveVariable = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables?.filter((_, i) => i !== index) || [],
    }))
  }

  const handleSave = () => {
    if (onSave && formData.name && formData.subject && formData.htmlContent) {
      onSave(formData as Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'>)
    }
  }

  const handlePreview = () => {
    if (onPreview) {
      onPreview(formData)
    }
  }

  const handleTestSend = () => {
    if (onTestSend && testEmail) {
      onTestSend(formData, testEmail)
      setTestEmail('')
    }
  }

  const isFormValid = formData.name && formData.subject && formData.htmlContent

  return (
    <div className={cn('max-w-4xl mx-auto', className)}>
      {/* Header */}
      <div className="mb-6">
        <Heading level="h3" className="text-gray-900 mb-2">
          {template ? 'Edit Email Template' : 'Create Email Template'}
        </Heading>
        <Text className="text-gray-600">
          Design and configure your email template with dynamic content and
          variables.
        </Text>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {[
            { id: 'content', label: 'Content' },
            { id: 'variables', label: 'Variables' },
            { id: 'settings', label: 'Settings' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Content Tab */}
      {activeTab === 'content' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="template-name">Template Name</Label>
              <Input
                id="template-name"
                value={formData.name || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('name', e.target.value)
                }
                placeholder="Enter template name"
                required
              />
            </div>

            <Select
              label="Category"
              value={formData.category || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange('category', e.target.value)
              }
              options={categoryOptions}
              required
            />
          </div>

          <Textarea
            label="Description"
            value={formData.description || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              handleInputChange('description', e.target.value)
            }
            placeholder="Brief description of this template"
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="subject-line">Subject Line</Label>
              <Input
                id="subject-line"
                value={formData.subject || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('subject', e.target.value)
                }
                placeholder="Email subject line"
                required
              />
            </div>

            <div>
              <Label htmlFor="preheader-text">Preheader Text</Label>
              <Input
                id="preheader-text"
                value={formData.preheader || ''}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  handleInputChange('preheader', e.target.value)
                }
                placeholder="Preview text shown in email clients"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="html-content">HTML Content</Label>
            <textarea
              id="html-content"
              value={formData.htmlContent || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange('htmlContent', e.target.value)
              }
              placeholder="Enter your HTML email content here..."
              rows={12}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              required
            />
            <Text className="text-xs text-gray-500 mt-1">
              Use variables like {`{{contact.firstName}}`} or{' '}
              {`{{organization.name}}`} for dynamic content.
            </Text>
          </div>

          <div>
            <Label htmlFor="text-content">Plain Text Content (Optional)</Label>
            <textarea
              id="text-content"
              value={formData.textContent || ''}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                handleInputChange('textContent', e.target.value)
              }
              placeholder="Plain text version of your email..."
              rows={6}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Variables Tab */}
      {activeTab === 'variables' && (
        <div className="space-y-6">
          <div>
            <Heading level="h4" className="text-gray-900 mb-4">
              Template Variables
            </Heading>
            <Text className="text-gray-600 mb-6">
              Define custom variables that can be used in your template content.
              These will be replaced with actual values when sending emails.
            </Text>
          </div>

          {/* Add New Variable */}
          <div className="border border-gray-200 rounded-lg p-4">
            <Heading level="h5" className="text-gray-900 mb-4">
              Add New Variable
            </Heading>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <Label htmlFor="variable-name">Variable Name</Label>
                <Input
                  id="variable-name"
                  value={newVariable.name || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewVariable(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="e.g., userName"
                />
              </div>

              <Select
                label="Type"
                value={newVariable.type || 'text'}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                  setNewVariable(prev => ({
                    ...prev,
                    type: e.target.value as any,
                  }))
                }
                options={variableTypeOptions}
              />

              <div>
                <Label htmlFor="default-value">Default Value</Label>
                <Input
                  id="default-value"
                  value={newVariable.defaultValue || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewVariable(prev => ({
                      ...prev,
                      defaultValue: e.target.value,
                    }))
                  }
                  placeholder="Default value"
                />
              </div>
            </div>

            <div className="mb-4">
              <Textarea
                label="Description"
                value={newVariable.description || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewVariable(prev => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Description of this variable"
                rows={2}
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={newVariable.required || false}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setNewVariable(prev => ({
                      ...prev,
                      required: e.target.checked,
                    }))
                  }
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Required variable
                </span>
              </label>

              <Button onClick={handleAddVariable} disabled={!newVariable.name}>
                Add Variable
              </Button>
            </div>
          </div>

          {/* Existing Variables */}
          <div className="space-y-3">
            {formData.variables?.map((variable, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <Text className="font-medium text-gray-900">
                        {`{{${variable.name}}}`}
                      </Text>
                      <Badge variant="outline">{variable.type}</Badge>
                      {variable.required && (
                        <Badge variant="destructive">Required</Badge>
                      )}
                    </div>
                    {variable.description && (
                      <Text className="text-sm text-gray-600 mb-1">
                        {variable.description}
                      </Text>
                    )}
                    {variable.defaultValue && (
                      <Text className="text-xs text-gray-500">
                        Default: {variable.defaultValue}
                      </Text>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => handleRemoveVariable(index)}
                    className="text-red-600 hover:text-red-700"
                  >
                    Remove
                  </Button>
                </div>
              </div>
            ))}

            {(!formData.variables || formData.variables.length === 0) && (
              <div className="text-center py-8">
                <Text className="text-gray-500">
                  No variables defined yet. Add variables to make your template
                  dynamic.
                </Text>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Industry"
              value={formData.industry || ''}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange('industry', e.target.value)
              }
              options={industryOptions}
              placeholder="Select industry"
            />

            <Select
              label="Status"
              value={formData.status || 'draft'}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                handleInputChange('status', e.target.value)
              }
              options={[
                { value: 'draft', label: 'Draft' },
                { value: 'active', label: 'Active' },
                { value: 'archived', label: 'Archived' },
              ]}
            />
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="border-t border-gray-200 pt-6 mt-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {onPreview && (
              <Button
                variant="outline"
                onClick={handlePreview}
                disabled={!formData.htmlContent}
              >
                Preview
              </Button>
            )}

            {onTestSend && (
              <div className="flex items-center space-x-2">
                <Input
                  value={testEmail}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setTestEmail(e.target.value)
                  }
                  placeholder="test@example.com"
                  type="email"
                  className="w-48"
                />
                <Button
                  variant="outline"
                  onClick={handleTestSend}
                  disabled={!testEmail || !formData.htmlContent}
                >
                  Test Send
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {onCancel && (
              <Button variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}

            <Button
              onClick={handleSave}
              disabled={!isFormValid || loading}
              loading={loading}
            >
              {template ? 'Update Template' : 'Save Template'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
