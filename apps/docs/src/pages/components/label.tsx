import { ComponentLayout } from '@/components/ComponentLayout'
import { Label } from '@nextsaas/ui'

const LabelDocs = () => {
  return (
    <ComponentLayout
      title="Label"
      description="A form label component that provides accessible labeling for form inputs with variants and required indicators."
    >
      <div className="space-y-8">
        {/* Basic Usage */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Basic Usage</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <Label htmlFor="basic-input">Basic Label</Label>
              <input
                id="basic-input"
                type="text"
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Enter text..."
              />
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="basic-input">Basic Label</Label>
<input id="basic-input" type="text" placeholder="Enter text..." />`}</code>
            </pre>
          </div>
        </section>

        {/* Required Label */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Required Label</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg">
              <Label htmlFor="required-input" required>
                Required Field
              </Label>
              <input
                id="required-input"
                type="text"
                className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="This field is required..."
              />
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label htmlFor="required-input" required>
  Required Field
</Label>`}</code>
            </pre>
          </div>
        </section>

        {/* Size Variants */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Size Variants</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg space-y-4">
              <div>
                <Label size="sm">Small Label</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Small input..."
                />
              </div>
              <div>
                <Label size="md">Medium Label (Default)</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Medium input..."
                />
              </div>
              <div>
                <Label size="lg">Large Label</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                  placeholder="Large input..."
                />
              </div>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label size="sm">Small Label</Label>
<Label size="md">Medium Label (Default)</Label>
<Label size="lg">Large Label</Label>`}</code>
            </pre>
          </div>
        </section>

        {/* Variant Styles */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Variant Styles</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg space-y-4">
              <div>
                <Label variant="default">Default Label</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Default styling..."
                />
              </div>
              <div>
                <Label variant="muted">Muted Label</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Muted styling..."
                />
              </div>
              <div>
                <Label variant="destructive">Error Label</Label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-red-300 rounded-md"
                  placeholder="Error state..."
                />
              </div>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label variant="default">Default Label</Label>
<Label variant="muted">Muted Label</Label>
<Label variant="destructive">Error Label</Label>`}</code>
            </pre>
          </div>
        </section>

        {/* Combined Examples */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Combined Examples</h2>
          <div className="space-y-4">
            <div className="p-6 border rounded-lg space-y-4">
              <div>
                <Label size="lg" variant="default" required>
                  Large Required Field
                </Label>
                <input
                  type="email"
                  className="mt-2 block w-full px-3 py-2 border border-gray-300 rounded-md text-lg"
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label size="sm" variant="muted">
                  Small Muted Helper Text
                </Label>
                <textarea
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  rows={3}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              <code>{`<Label size="lg" variant="default" required>
  Large Required Field
</Label>

<Label size="sm" variant="muted">
  Small Muted Helper Text
</Label>`}</code>
            </pre>
          </div>
        </section>

        {/* Props API */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Props API</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Prop
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Default
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    size
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    'sm' | 'md' | 'lg'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    'md'
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 border-b">
                    Controls the text size of the label
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    variant
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    'default' | 'muted' | 'destructive'
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    'default'
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 border-b">
                    Controls the color scheme of the label
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    required
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    boolean
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    false
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 border-b">
                    Adds a red asterisk (*) to indicate required field
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 border-b">
                    className
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 border-b">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 border-b">
                    Additional CSS classes to apply
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    htmlFor
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    string
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    undefined
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    Associates the label with a form control (accessibility)
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Accessibility */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Accessibility</h2>
          <div className="prose">
            <ul className="list-disc pl-6 space-y-2">
              <li>Always use the `htmlFor` prop to associate labels with form controls</li>
              <li>The `required` prop adds a visual indicator without affecting screen readers - ensure you also add `aria-required` to the input</li>
              <li>Labels are automatically focusable and will focus their associated input when clicked</li>
              <li>Use appropriate size and variant combinations to maintain sufficient color contrast</li>
            </ul>
          </div>
        </section>
      </div>
    </ComponentLayout>
  )
}

export default LabelDocs