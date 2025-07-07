import { Radio } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [selected, setSelected] = useState('option1')

  return (
    <div className="space-y-3">
      <Radio
        name="basic"
        value="option1"
        checked={selected === 'option1'}
        onChange={(e) => setSelected(e.target.value)}
        label="Option 1"
      />
      <Radio
        name="basic"
        value="option2"
        checked={selected === 'option2'}
        onChange={(e) => setSelected(e.target.value)}
        label="Option 2"
      />
      <Radio
        name="basic"
        value="option3"
        checked={selected === 'option3'}
        onChange={(e) => setSelected(e.target.value)}
        label="Option 3"
      />
    </div>
  )
}

const DescriptionExample = () => {
  const [plan, setPlan] = useState('basic')

  return (
    <div className="space-y-4">
      <Radio
        name="plan"
        value="basic"
        checked={plan === 'basic'}
        onChange={(e) => setPlan(e.target.value)}
        label="Basic Plan"
        description="Perfect for individuals getting started"
      />
      <Radio
        name="plan"
        value="pro"
        checked={plan === 'pro'}
        onChange={(e) => setPlan(e.target.value)}
        label="Pro Plan"
        description="Best for growing teams and businesses"
      />
      <Radio
        name="plan"
        value="enterprise"
        checked={plan === 'enterprise'}
        onChange={(e) => setPlan(e.target.value)}
        label="Enterprise Plan"
        description="Advanced features for large organizations"
      />
    </div>
  )
}

const DisabledExample = () => {
  return (
    <div className="space-y-3">
      <Radio
        name="disabled"
        value="enabled"
        checked={true}
        label="Enabled Option"
        readOnly
      />
      <Radio
        name="disabled"
        value="disabled"
        checked={false}
        disabled
        label="Disabled Option"
      />
      <Radio
        name="disabled"
        value="disabled-checked"
        checked={true}
        disabled
        label="Disabled Checked Option"
        readOnly
      />
    </div>
  )
}

const GroupExample = () => {
  const [notification, setNotification] = useState('email')

  const options = [
    { value: 'email', label: 'Email', description: 'Get notified via email' },
    { value: 'sms', label: 'SMS', description: 'Get notified via text message' },
    { value: 'push', label: 'Push', description: 'Get notified via push notifications' },
    { value: 'none', label: 'None', description: 'Turn off all notifications' },
  ]

  return (
    <div>
      <h3 className="text-sm font-medium text-gray-900 mb-3">Notification Preferences</h3>
      <div className="space-y-3">
        {options.map((option) => (
          <Radio
            key={option.value}
            name="notification"
            value={option.value}
            checked={notification === option.value}
            onChange={(e) => setNotification(e.target.value)}
            label={option.label}
            description={option.description}
          />
        ))}
      </div>
    </div>
  )
}

const SizesExample = () => {
  const [size, setSize] = useState('md')

  return (
    <div className="space-y-3">
      <Radio
        name="sizes"
        value="sm"
        checked={size === 'sm'}
        onChange={(e) => setSize(e.target.value)}
        label="Small"
        size="sm"
      />
      <Radio
        name="sizes"
        value="md"
        checked={size === 'md'}
        onChange={(e) => setSize(e.target.value)}
        label="Medium (Default)"
        size="md"
      />
      <Radio
        name="sizes"
        value="lg"
        checked={size === 'lg'}
        onChange={(e) => setSize(e.target.value)}
        label="Large"
        size="lg"
      />
    </div>
  )
}

const examples = [
  {
    title: 'Basic Radio Buttons',
    code: `const [selected, setSelected] = useState('option1')

<div className="space-y-3">
  <Radio
    name="basic"
    value="option1"
    checked={selected === 'option1'}
    onChange={(e) => setSelected(e.target.value)}
    label="Option 1"
  />
  <Radio
    name="basic"
    value="option2"
    checked={selected === 'option2'}
    onChange={(e) => setSelected(e.target.value)}
    label="Option 2"
  />
  <Radio
    name="basic"
    value="option3"
    checked={selected === 'option3'}
    onChange={(e) => setSelected(e.target.value)}
    label="Option 3"
  />
</div>`,
    component: <BasicExample />,
  },
  {
    title: 'With Descriptions',
    code: `const [plan, setPlan] = useState('basic')

<Radio
  name="plan"
  value="basic"
  checked={plan === 'basic'}
  onChange={(e) => setPlan(e.target.value)}
  label="Basic Plan"
  description="Perfect for individuals getting started"
/>`,
    component: <DescriptionExample />,
  },
  {
    title: 'Disabled States',
    code: `<div className="space-y-3">
  <Radio
    name="disabled"
    value="enabled"
    checked={true}
    label="Enabled Option"
    readOnly
  />
  <Radio
    name="disabled"
    value="disabled"
    checked={false}
    disabled
    label="Disabled Option"
  />
  <Radio
    name="disabled"
    value="disabled-checked"
    checked={true}
    disabled
    label="Disabled Checked Option"
    readOnly
  />
</div>`,
    component: <DisabledExample />,
  },
  {
    title: 'Radio Group',
    code: `const [notification, setNotification] = useState('email')

const options = [
  { value: 'email', label: 'Email', description: 'Get notified via email' },
  { value: 'sms', label: 'SMS', description: 'Get notified via text message' },
  { value: 'push', label: 'Push', description: 'Get notified via push notifications' },
  { value: 'none', label: 'None', description: 'Turn off all notifications' },
]

<div className="space-y-3">
  {options.map((option) => (
    <Radio
      key={option.value}
      name="notification"
      value={option.value}
      checked={notification === option.value}
      onChange={(e) => setNotification(e.target.value)}
      label={option.label}
      description={option.description}
    />
  ))}
</div>`,
    component: <GroupExample />,
  },
  {
    title: 'Different Sizes',
    code: `const [size, setSize] = useState('md')

<div className="space-y-3">
  <Radio
    name="sizes"
    value="sm"
    checked={size === 'sm'}
    onChange={(e) => setSize(e.target.value)}
    label="Small"
    size="sm"
  />
  <Radio
    name="sizes"
    value="md"
    checked={size === 'md'}
    onChange={(e) => setSize(e.target.value)}
    label="Medium (Default)"
    size="md"
  />
  <Radio
    name="sizes"
    value="lg"
    checked={size === 'lg'}
    onChange={(e) => setSize(e.target.value)}
    label="Large"
    size="lg"
  />
</div>`,
    component: <SizesExample />,
  },
]

export default function RadioPage() {
  return (
    <ComponentLayout
      title="Radio"
      description="A radio button component for selecting a single option from a list of mutually exclusive choices."
      examples={examples}
    />
  )
}