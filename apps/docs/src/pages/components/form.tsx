import { Form, FormField, Input, Button, Textarea, Select, Checkbox } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField label="Name" required>
        <Input
          value={formData.name}
          onChange={(e) => handleChange('name', e.target.value)}
          placeholder="Enter your name"
        />
      </FormField>
      
      <FormField label="Email" required>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter your email"
        />
      </FormField>
      
      <FormField label="Message">
        <Textarea
          value={formData.message}
          onChange={(e) => handleChange('message', e.target.value)}
          placeholder="Enter your message"
          rows={4}
        />
      </FormField>
      
      <Button type="submit" variant="primary">
        Submit Form
      </Button>
    </Form>
  )
}

const ValidationExample = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.username) {
      newErrors.username = 'Username is required'
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters'
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      console.log('Form is valid:', formData)
    }
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <Form onSubmit={handleSubmit}>
      <FormField label="Username" required error={errors.username}>
        <Input
          value={formData.username}
          onChange={(e) => handleChange('username', e.target.value)}
          placeholder="Enter username"
        />
      </FormField>
      
      <FormField label="Password" required error={errors.password}>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Enter password"
        />
      </FormField>
      
      <FormField label="Confirm Password" required error={errors.confirmPassword}>
        <Input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          placeholder="Confirm password"
        />
      </FormField>
      
      <Button type="submit" variant="primary">
        Create Account
      </Button>
    </Form>
  )
}

const ComplexExample = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    country: '',
    bio: '',
    newsletter: false,
    terms: false
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Complex form submitted:', formData)
  }

  const handleChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Form onSubmit={handleSubmit} className="max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="First Name" required>
          <Input
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="John"
          />
        </FormField>
        
        <FormField label="Last Name" required>
          <Input
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Doe"
          />
        </FormField>
      </div>
      
      <FormField label="Email Address" required>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="john@example.com"
        />
      </FormField>
      
      <FormField label="Country" required>
        <Select
          value={formData.country}
          onChange={(value) => handleChange('country', value)}
          placeholder="Select a country"
          options={[
            { value: 'us', label: 'United States' },
            { value: 'ca', label: 'Canada' },
            { value: 'uk', label: 'United Kingdom' },
            { value: 'de', label: 'Germany' },
            { value: 'fr', label: 'France' },
          ]}
        />
      </FormField>
      
      <FormField 
        label="Bio" 
        description="Tell us a little about yourself (optional)"
      >
        <Textarea
          value={formData.bio}
          onChange={(e) => handleChange('bio', e.target.value)}
          placeholder="Write your bio here..."
          rows={4}
        />
      </FormField>
      
      <div className="space-y-3">
        <Checkbox
          checked={formData.newsletter}
          onChange={(checked) => handleChange('newsletter', checked)}
          label="Subscribe to newsletter"
          description="Get updates about new features and products"
        />
        
        <Checkbox
          checked={formData.terms}
          onChange={(checked) => handleChange('terms', checked)}
          label="I agree to the terms and conditions"
          required
        />
      </div>
      
      <div className="flex gap-4">
        <Button type="submit" variant="primary" disabled={!formData.terms}>
          Submit Application
        </Button>
        <Button type="button" variant="outline">
          Save Draft
        </Button>
      </div>
    </Form>
  )
}

const LoadingExample = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    setIsLoading(false)
    console.log('Login submitted:', formData)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <Form onSubmit={handleSubmit} loading={isLoading}>
      <FormField label="Email" required>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="Enter your email"
          disabled={isLoading}
        />
      </FormField>
      
      <FormField label="Password" required>
        <Input
          type="password"
          value={formData.password}
          onChange={(e) => handleChange('password', e.target.value)}
          placeholder="Enter your password"
          disabled={isLoading}
        />
      </FormField>
      
      <Button type="submit" variant="primary" loading={isLoading}>
        {isLoading ? 'Signing In...' : 'Sign In'}
      </Button>
    </Form>
  )
}

const examples = [
  {
    title: 'Basic Form',
    code: `const [formData, setFormData] = useState({
  name: '',
  email: '',
  message: ''
})

const handleSubmit = (e) => {
  e.preventDefault()
  console.log('Form submitted:', formData)
}

<Form onSubmit={handleSubmit}>
  <FormField label="Name" required>
    <Input
      value={formData.name}
      onChange={(e) => handleChange('name', e.target.value)}
      placeholder="Enter your name"
    />
  </FormField>
  
  <FormField label="Email" required>
    <Input
      type="email"
      value={formData.email}
      onChange={(e) => handleChange('email', e.target.value)}
      placeholder="Enter your email"
    />
  </FormField>
  
  <FormField label="Message">
    <Textarea
      value={formData.message}
      onChange={(e) => handleChange('message', e.target.value)}
      placeholder="Enter your message"
    />
  </FormField>
  
  <Button type="submit" variant="primary">
    Submit Form
  </Button>
</Form>`,
    component: <BasicExample />,
  },
  {
    title: 'Form with Validation',
    code: `const [formData, setFormData] = useState({
  username: '',
  password: '',
  confirmPassword: ''
})
const [errors, setErrors] = useState({})

const validateForm = () => {
  const newErrors = {}
  
  if (!formData.username) {
    newErrors.username = 'Username is required'
  } else if (formData.username.length < 3) {
    newErrors.username = 'Username must be at least 3 characters'
  }
  
  if (!formData.password) {
    newErrors.password = 'Password is required'
  } else if (formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters'
  }
  
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match'
  }
  
  setErrors(newErrors)
  return Object.keys(newErrors).length === 0
}

<Form onSubmit={handleSubmit}>
  <FormField label="Username" required error={errors.username}>
    <Input
      value={formData.username}
      onChange={(e) => handleChange('username', e.target.value)}
      placeholder="Enter username"
    />
  </FormField>
  
  <FormField label="Password" required error={errors.password}>
    <Input
      type="password"
      value={formData.password}
      onChange={(e) => handleChange('password', e.target.value)}
      placeholder="Enter password"
    />
  </FormField>
  
  <Button type="submit" variant="primary">
    Create Account
  </Button>
</Form>`,
    component: <ValidationExample />,
  },
  {
    title: 'Complex Form Layout',
    code: `<Form onSubmit={handleSubmit} className="max-w-2xl">
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <FormField label="First Name" required>
      <Input value={formData.firstName} onChange={handleChange} />
    </FormField>
    <FormField label="Last Name" required>
      <Input value={formData.lastName} onChange={handleChange} />
    </FormField>
  </div>
  
  <FormField label="Email Address" required>
    <Input type="email" value={formData.email} onChange={handleChange} />
  </FormField>
  
  <FormField label="Country" required>
    <Select
      value={formData.country}
      onChange={handleChange}
      options={countryOptions}
    />
  </FormField>
  
  <FormField label="Bio" description="Tell us about yourself">
    <Textarea value={formData.bio} onChange={handleChange} />
  </FormField>
  
  <div className="space-y-3">
    <Checkbox
      checked={formData.newsletter}
      onChange={handleChange}
      label="Subscribe to newsletter"
    />
    <Checkbox
      checked={formData.terms}
      onChange={handleChange}
      label="I agree to the terms and conditions"
      required
    />
  </div>
  
  <div className="flex gap-4">
    <Button type="submit" variant="primary">Submit</Button>
    <Button type="button" variant="outline">Save Draft</Button>
  </div>
</Form>`,
    component: <ComplexExample />,
  },
  {
    title: 'Loading State',
    code: `const [isLoading, setIsLoading] = useState(false)

const handleSubmit = async (e) => {
  e.preventDefault()
  setIsLoading(true)
  
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  setIsLoading(false)
}

<Form onSubmit={handleSubmit} loading={isLoading}>
  <FormField label="Email" required>
    <Input
      type="email"
      disabled={isLoading}
      placeholder="Enter your email"
    />
  </FormField>
  
  <FormField label="Password" required>
    <Input
      type="password"
      disabled={isLoading}
      placeholder="Enter your password"
    />
  </FormField>
  
  <Button type="submit" variant="primary" loading={isLoading}>
    {isLoading ? 'Signing In...' : 'Sign In'}
  </Button>
</Form>`,
    component: <LoadingExample />,
  },
]

export default function FormPage() {
  return (
    <ComponentLayout
      title="Form"
      description="A comprehensive form wrapper component that handles submission, validation states, and provides consistent spacing and layout for form elements."
      examples={examples}
    />
  )
}