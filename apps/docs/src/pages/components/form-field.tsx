import { FormField, FormSection } from '@nextsaas/ui'
import { Input, Button, Textarea, Checkbox } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'

const examples = [
  {
    title: 'Basic Form Field',
    code: `<FormField label="Email" required>
  <Input type="email" placeholder="Enter your email" />
</FormField>`,
    component: (
      <FormField label="Email" required>
        <Input type="email" placeholder="Enter your email" />
      </FormField>
    ),
  },
  {
    title: 'Form Field with Description',
    code: `<FormField 
  label="Username" 
  description="This will be your public display name."
>
  <Input placeholder="Enter username" />
</FormField>`,
    component: (
      <FormField 
        label="Username" 
        description="This will be your public display name."
      >
        <Input placeholder="Enter username" />
      </FormField>
    ),
  },
  {
    title: 'Form Field with Error',
    code: `<FormField 
  label="Password" 
  error="Password must be at least 8 characters long"
  required
>
  <Input type="password" placeholder="Enter password" />
</FormField>`,
    component: (
      <FormField 
        label="Password" 
        error="Password must be at least 8 characters long"
        required
      >
        <Input type="password" placeholder="Enter password" />
      </FormField>
    ),
  },
  {
    title: 'Disabled Form Field',
    code: `<FormField 
  label="Account Type" 
  description="This field is read-only."
  disabled
>
  <Input value="Premium Account" readOnly />
</FormField>`,
    component: (
      <FormField 
        label="Account Type" 
        description="This field is read-only."
        disabled
      >
        <Input value="Premium Account" readOnly />
      </FormField>
    ),
  },
  {
    title: 'Form Field with Textarea',
    code: `<FormField 
  label="Bio" 
  description="Tell us a little bit about yourself."
>
  <Textarea placeholder="Write your bio here..." />
</FormField>`,
    component: (
      <FormField 
        label="Bio" 
        description="Tell us a little bit about yourself."
      >
        <Textarea placeholder="Write your bio here..." />
      </FormField>
    ),
  },
  {
    title: 'Form Section Example',
    code: `<FormSection 
  title="Personal Information" 
  description="Update your personal details here."
>
  <FormField label="First Name" required>
    <Input placeholder="John" />
  </FormField>
  <FormField label="Last Name" required>
    <Input placeholder="Doe" />
  </FormField>
  <FormField label="Email" required>
    <Input type="email" placeholder="john@example.com" />
  </FormField>
</FormSection>`,
    component: (
      <FormSection 
        title="Personal Information" 
        description="Update your personal details here."
      >
        <FormField label="First Name" required>
          <Input placeholder="John" />
        </FormField>
        <FormField label="Last Name" required>
          <Input placeholder="Doe" />
        </FormField>
        <FormField label="Email" required>
          <Input type="email" placeholder="john@example.com" />
        </FormField>
      </FormSection>
    ),
  },
]

export default function FormFieldPage() {
  return (
    <ComponentLayout
      title="Form Field"
      description="A wrapper component that provides consistent styling and behavior for form inputs with labels, descriptions, and error messages."
      examples={examples}
    />
  )
}