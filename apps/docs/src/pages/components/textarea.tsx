import { Textarea } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'

const BasicExample = () => {
  const [value, setValue] = useState('')

  return (
    <Textarea
      placeholder="Enter your message here..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
    />
  )
}

const SizesExample = () => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Small textarea"
        size="sm"
        rows={2}
      />
      <Textarea
        placeholder="Medium textarea (default)"
        size="md"
        rows={3}
      />
      <Textarea
        placeholder="Large textarea"
        size="lg"
        rows={4}
      />
    </div>
  )
}

const VariantsExample = () => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Default variant"
        variant="default"
      />
      <Textarea
        placeholder="Error variant"
        variant="error"
        value="This field has an error"
      />
      <Textarea
        placeholder="Success variant"
        variant="success"
        value="This field is valid"
      />
    </div>
  )
}

const StatesExample = () => {
  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Normal state"
      />
      <Textarea
        placeholder="Disabled state"
        disabled
      />
      <Textarea
        placeholder="Read-only state"
        value="This content is read-only"
        readOnly
      />
    </div>
  )
}

const ResizableExample = () => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Not Resizable
        </label>
        <Textarea
          placeholder="This textarea cannot be resized"
          resize="none"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Vertical Resize
        </label>
        <Textarea
          placeholder="This textarea can be resized vertically"
          resize="vertical"
          rows={3}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Both Directions
        </label>
        <Textarea
          placeholder="This textarea can be resized in both directions"
          resize="both"
          rows={3}
        />
      </div>
    </div>
  )
}

const CharacterCountExample = () => {
  const [value, setValue] = useState('')
  const maxLength = 200

  return (
    <div>
      <Textarea
        placeholder="Write your bio (max 200 characters)..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        rows={4}
      />
      <div className="mt-2 text-sm text-gray-500 text-right">
        {value.length}/{maxLength} characters
      </div>
    </div>
  )
}

const AutoResizeExample = () => {
  const [value, setValue] = useState('')

  return (
    <Textarea
      placeholder="This textarea grows as you type..."
      value={value}
      onChange={(e) => setValue(e.target.value)}
      autoResize
      minRows={2}
      maxRows={6}
    />
  )
}

const examples = [
  {
    title: 'Basic Textarea',
    code: `const [value, setValue] = useState('')

<Textarea
  placeholder="Enter your message here..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>`,
    component: <BasicExample />,
  },
  {
    title: 'Different Sizes',
    code: `<div className="space-y-4">
  <Textarea
    placeholder="Small textarea"
    size="sm"
    rows={2}
  />
  <Textarea
    placeholder="Medium textarea (default)"
    size="md"
    rows={3}
  />
  <Textarea
    placeholder="Large textarea"
    size="lg"
    rows={4}
  />
</div>`,
    component: <SizesExample />,
  },
  {
    title: 'Variants',
    code: `<div className="space-y-4">
  <Textarea
    placeholder="Default variant"
    variant="default"
  />
  <Textarea
    placeholder="Error variant"
    variant="error"
    value="This field has an error"
  />
  <Textarea
    placeholder="Success variant"
    variant="success"
    value="This field is valid"
  />
</div>`,
    component: <VariantsExample />,
  },
  {
    title: 'States',
    code: `<div className="space-y-4">
  <Textarea placeholder="Normal state" />
  <Textarea placeholder="Disabled state" disabled />
  <Textarea 
    placeholder="Read-only state" 
    value="This content is read-only" 
    readOnly 
  />
</div>`,
    component: <StatesExample />,
  },
  {
    title: 'Resize Options',
    code: `<div className="space-y-4">
  <Textarea
    placeholder="Not resizable"
    resize="none"
    rows={3}
  />
  <Textarea
    placeholder="Vertical resize only"
    resize="vertical"
    rows={3}
  />
  <Textarea
    placeholder="Both directions"
    resize="both"
    rows={3}
  />
</div>`,
    component: <ResizableExample />,
  },
  {
    title: 'Character Count',
    code: `const [value, setValue] = useState('')
const maxLength = 200

<div>
  <Textarea
    placeholder="Write your bio (max 200 characters)..."
    value={value}
    onChange={(e) => setValue(e.target.value)}
    maxLength={maxLength}
    rows={4}
  />
  <div className="mt-2 text-sm text-gray-500 text-right">
    {value.length}/{maxLength} characters
  </div>
</div>`,
    component: <CharacterCountExample />,
  },
  {
    title: 'Auto Resize',
    code: `const [value, setValue] = useState('')

<Textarea
  placeholder="This textarea grows as you type..."
  value={value}
  onChange={(e) => setValue(e.target.value)}
  autoResize
  minRows={2}
  maxRows={6}
/>`,
    component: <AutoResizeExample />,
  },
]

export default function TextareaPage() {
  return (
    <ComponentLayout
      title="Textarea"
      description="A multi-line text input component for longer text content with support for auto-resize, character limits, and validation states."
      examples={examples}
    />
  )
}