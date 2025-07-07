export default function UIComponentsPage() {
  return (
    <div className="prose max-w-none">
      <h1>🎨 UI Components</h1>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">
          ✅ 50+ Ready-to-Use Components
        </p>
        <p className="text-green-800">
          A complete component library built with Tailwind CSS, fully typed and
          customizable.
        </p>
      </div>

      <h2>Overview</h2>

      <p>
        The <code>@nextsaas/ui</code> package provides a comprehensive set of
        React components that are shared across all your applications. All
        components are:
      </p>

      <ul>
        <li>Built with Tailwind CSS for easy customization</li>
        <li>Fully typed with TypeScript</li>
        <li>Accessible (WCAG compliant)</li>
        <li>Dark mode compatible</li>
        <li>Responsive by default</li>
      </ul>

      <h2>🚀 Using Components</h2>

      <pre>
        <code>{`import { 
  Button, 
  Card, 
  Input, 
  Modal,
  Toast 
} from '@nextsaas/ui';

export function MyComponent() {
  return (
    <Card>
      <h2>Welcome!</h2>
      <Input 
        label="Email" 
        type="email" 
        placeholder="Enter your email"
      />
      <Button variant="primary" size="lg">
        Get Started
      </Button>
    </Card>
  );
}`}</code>
      </pre>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h3 className="text-blue-900 font-semibold mb-2">🎨 Component Library</h3>
        <p className="text-blue-800 mb-3">
          View all 50+ components in one place with visual examples and categories.
        </p>
        <a
          href="/components"
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          View Component Gallery →
        </a>
      </div>

      <h2>📦 Available Components</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 not-prose">
        <div>
          <h3 className="font-semibold text-lg mb-3">Layout Components</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Container</code> - Responsive container ✅
            </li>
            <li>
              <code>Grid</code> - Grid layout system ✅
            </li>
            <li>
              <code>Stack</code> - Vertical/horizontal stacks ✅
            </li>
            <li>
              <code>Card</code> - Content cards
            </li>
            <li>
              <code>Section</code> - Page sections ✅
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Form Components</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Input</code> - Text inputs
            </li>
            <li>
              <code>Select</code> - Dropdowns ✅
            </li>
            <li>
              <code>Checkbox</code> - Checkboxes ✅
            </li>
            <li>
              <code>Radio</code> - Radio buttons ✅
            </li>
            <li>
              <code>Switch</code> - Toggle switches
            </li>
            <li>
              <code>Textarea</code> - Multi-line text ✅
            </li>
            <li>
              <code>Form</code> - Form wrapper ✅
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Navigation</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Navbar</code> - Navigation bar
            </li>
            <li>
              <code>Sidebar</code> - Side navigation
            </li>
            <li>
              <code>Tabs</code> - Tab navigation ✅
            </li>
            <li>
              <code>Breadcrumb</code> - Breadcrumbs ✅
            </li>
            <li>
              <code>Pagination</code> - Page navigation ✅
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Feedback</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Alert</code> - Alert messages
            </li>
            <li>
              <code>Toast</code> - Toast notifications
            </li>
            <li>
              <code>Modal</code> - Modal dialogs
            </li>
            <li>
              <code>Drawer</code> - Slide-out panels ✅
            </li>
            <li>
              <code>Tooltip</code> - Hover tooltips ✅
            </li>
            <li>
              <code>Progress</code> - Progress bars ✅
            </li>
            <li>
              <code>Spinner</code> - Loading spinners
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Data Display</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Table</code> - Data tables
            </li>
            <li>
              <code>List</code> - Lists
            </li>
            <li>
              <code>Avatar</code> - User avatars
            </li>
            <li>
              <code>Badge</code> - Status badges
            </li>
            <li>
              <code>Tag</code> - Tags/chips ✅
            </li>
            <li>
              <code>Stat</code> - Statistics display
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg mb-3">Actions</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <code>Button</code> - Buttons
            </li>
            <li>
              <code>IconButton</code> - Icon buttons ✅
            </li>
            <li>
              <code>Link</code> - Styled links
            </li>
            <li>
              <code>Menu</code> - Dropdown menus
            </li>
            <li>
              <code>ContextMenu</code> - Right-click menus
            </li>
          </ul>
        </div>
      </div>

      <h2>🎨 Component Examples</h2>

      <h3>Buttons</h3>

      <pre>
        <code>{`// Different variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="danger">Danger</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// With icons
<Button leftIcon={<PlusIcon />}>
  Add Item
</Button>

// Loading state
<Button isLoading loadingText="Saving...">
  Save
</Button>`}</code>
      </pre>

      <h3>Forms</h3>

      <pre>
        <code>{`import { Form, Input, Select, Button } from '@nextsaas/ui';

<Form onSubmit={handleSubmit}>
  <Input
    label="Name"
    name="name"
    required
    error={errors.name}
  />
  
  <Select
    label="Country"
    name="country"
    options={[
      { value: 'us', label: 'United States' },
      { value: 'uk', label: 'United Kingdom' },
    ]}
  />
  
  <Button type="submit" variant="primary">
    Submit
  </Button>
</Form>`}</code>
      </pre>

      <h3>Modals</h3>

      <pre>
        <code>{`import { Modal, useModal } from '@nextsaas/ui';

function MyComponent() {
  const { isOpen, openModal, closeModal } = useModal();
  
  return (
    <>
      <Button onClick={openModal}>Open Modal</Button>
      
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        title="Confirm Action"
      >
        <p>Are you sure you want to continue?</p>
        
        <Modal.Footer>
          <Button variant="ghost" onClick={closeModal}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm}>
            Confirm
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}`}</code>
      </pre>

      <h3>Toast Notifications</h3>

      <pre>
        <code>{`import { useToast } from '@nextsaas/ui';

function MyComponent() {
  const toast = useToast();
  
  const handleSuccess = () => {
    toast.success('Operation completed successfully!');
  };
  
  const handleError = () => {
    toast.error('Something went wrong. Please try again.');
  };
  
  const handleCustom = () => {
    toast.show({
      title: 'New Message',
      description: 'You have a new message from John',
      duration: 5000,
      action: {
        label: 'View',
        onClick: () => console.log('View clicked')
      }
    });
  };
}`}</code>
      </pre>

      <h2>🎨 Customization</h2>

      <h3>Theme Configuration</h3>

      <p>
        Components use your Tailwind configuration. Update colors in your
        <code>tailwind.config.js</code>:
      </p>

      <pre>
        <code>{`// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a',
        },
        // Add your brand colors
      }
    }
  }
}`}</code>
      </pre>

      <h3>Component Variants</h3>

      <p>
        Most components support variants for different styles. You can also
        create custom variants:
      </p>

      <pre>
        <code>{`// Custom button variant
<Button 
  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white"
>
  Gradient Button
</Button>

// Custom card style
<Card className="border-2 border-blue-500 shadow-blue-500/20">
  Custom styled card
</Card>`}</code>
      </pre>

      <h2>📱 Responsive Design</h2>

      <p>
        All components are responsive by default. Use responsive props when
        available:
      </p>

      <pre>
        <code>{`// Responsive grid
<Grid cols={{ base: 1, md: 2, lg: 3 }} gap={4}>
  <Card>Item 1</Card>
  <Card>Item 2</Card>
  <Card>Item 3</Card>
</Grid>

// Responsive stack
<Stack 
  direction={{ base: 'column', md: 'row' }} 
  spacing={4}
>
  <Box>Item 1</Box>
  <Box>Item 2</Box>
</Stack>`}</code>
      </pre>

      <h2>🌙 Dark Mode</h2>

      <p>
        Components automatically support dark mode. The theme switches based on
        the user's system preference or manual toggle:
      </p>

      <pre>
        <code>{`import { useTheme } from '@nextsaas/ui';

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <Button onClick={toggleTheme}>
      {theme === 'dark' ? '☀️' : '🌙'}
    </Button>
  );
}`}</code>
      </pre>

      <h2>♿ Accessibility</h2>

      <p>All components follow WCAG 2.1 guidelines:</p>

      <ul>
        <li>Proper ARIA labels and roles</li>
        <li>Keyboard navigation support</li>
        <li>Focus management</li>
        <li>Screen reader friendly</li>
        <li>Sufficient color contrast</li>
      </ul>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <h3 className="text-blue-900 font-semibold mb-2">💡 Best Practices</h3>
        <ul className="text-blue-800 space-y-1">
          <li>• Use semantic component names for better code readability</li>
          <li>• Leverage component composition for complex UIs</li>
          <li>• Keep custom styles in your app, not in the UI package</li>
          <li>• Use the design tokens for consistent spacing and colors</li>
        </ul>
      </div>
    </div>
  )
}
