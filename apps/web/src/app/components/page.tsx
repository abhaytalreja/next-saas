'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Search,
  Moon,
  Sun,
  Check,
  X,
  Upload,
  Download,
  AlertCircle,
  Info,
  CheckCircle,
  AlertTriangle,
} from 'lucide-react'

// Import UI components
import {
  Button,
  Input,
  Badge,
  Avatar,
  Spinner,
  Switch,
  Heading,
  Text,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Alert,
  AlertTitle,
  AlertDescription,
  IconButton,
  Tag,
  Grid,
  Stack,
  Container,
  Section,
  Select,
  Checkbox,
  Radio,
  RadioGroup,
  Textarea,
  Form,
  Progress,
  CircularProgress,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Breadcrumb,
  Pagination,
  Tooltip,
  TooltipProvider,
  Drawer,
  Modal,
  useModal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  AlertDialog,
  ToastProvider,
  useToast,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
  List,
  ListItem,
  DescriptionList,
  DescriptionListItem,
  Checklist,
  ChecklistItem,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  StatCard,
  StatGroup,
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarActions,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarItem,
  SidebarToggle,
  Menu,
  MenuTrigger,
  MenuContent,
  MenuItem,
  MenuSeparator,
  MenuLabel,
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  Link as UILink,
  NavLink,
  TextLink,
  ButtonLink,
} from '@nextsaas/ui'

export default function ComponentsPage() {
  const searchParams = useSearchParams()
  const tabFromUrl = searchParams.get('tab')
  const [selectedTab, setSelectedTab] = useState(tabFromUrl || 'buttons')
  const [switchChecked, setSwitchChecked] = useState(false)
  const [checkboxChecked, setCheckboxChecked] = useState(false)
  const [radioValue, setRadioValue] = useState('option1')
  const [currentPage, setCurrentPage] = useState(1)
  const { toast } = useToast()
  const modalExample = useModal()
  const alertDialogExample = useModal()

  useEffect(() => {
    if (tabFromUrl) {
      setSelectedTab(tabFromUrl)
    }
  }, [tabFromUrl])

  const componentCategories = [
    {
      id: 'actions',
      name: 'Actions',
      items: ['buttons', 'links', 'icon-buttons', 'menus'],
    },
    {
      id: 'forms',
      name: 'Form Elements',
      items: ['inputs', 'select', 'checkbox-radio', 'textarea', 'switch'],
    },
    {
      id: 'layout',
      name: 'Layout',
      items: ['container', 'grid', 'stack', 'section'],
    },
    {
      id: 'navigation',
      name: 'Navigation',
      items: ['navbar', 'sidebar', 'tabs', 'breadcrumb', 'pagination'],
    },
    {
      id: 'data-display',
      name: 'Data Display',
      items: ['cards', 'table', 'list', 'stats', 'badges', 'avatars'],
    },
    {
      id: 'feedback',
      name: 'Feedback',
      items: [
        'alerts',
        'progress',
        'spinner',
        'tooltip',
        'toast',
        'modal',
        'drawer',
      ],
    },
  ]

  const renderComponentDemo = () => {
    switch (selectedTab) {
      case 'buttons':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Button Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Button variant="default">Default</Button>
                <Button variant="destructive">Destructive</Button>
                <Button variant="outline">Outline</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button variant="link">Link</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Button Sizes</h3>
              <div className="flex items-center gap-4">
                <Button size="sm">Small</Button>
                <Button size="default">Default</Button>
                <Button size="lg">Large</Button>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Button States</h3>
              <div className="flex flex-wrap gap-4">
                <Button disabled>Disabled</Button>
                <Button loading>Loading</Button>
                <Button icon={Upload}>With Icon</Button>
              </div>
            </div>
          </div>
        )

      case 'links':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Link Variants</h3>
              <div className="flex flex-col gap-4">
                <UILink href="#" variant="default">
                  Default Link
                </UILink>
                <UILink href="#" variant="muted">
                  Muted Link
                </UILink>
                <UILink href="#" variant="subtle">
                  Subtle Link
                </UILink>
                <UILink href="#" variant="ghost">
                  Ghost Link
                </UILink>
                <UILink href="#" external>
                  External Link
                </UILink>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Specialized Links</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <NavLink href="#" active>
                    Active Nav Link
                  </NavLink>
                  <NavLink href="#">Inactive Nav Link</NavLink>
                </div>
                <div>
                  <TextLink href="#">
                    This is an inline <TextLink href="#">text link</TextLink>{' '}
                    within a paragraph.
                  </TextLink>
                </div>
                <div className="flex gap-4">
                  <ButtonLink href="#" buttonVariant="primary">
                    Primary Button Link
                  </ButtonLink>
                  <ButtonLink href="#" buttonVariant="outline">
                    Outline Button Link
                  </ButtonLink>
                </div>
              </div>
            </div>
          </div>
        )

      case 'icon-buttons':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Icon Button Variants
              </h3>
              <div className="flex gap-4">
                <IconButton
                  icon={Search}
                  variant="default"
                  aria-label="Search"
                />
                <IconButton
                  icon={Moon}
                  variant="outline"
                  aria-label="Toggle theme"
                />
                <IconButton icon={X} variant="ghost" aria-label="Close" />
                <IconButton
                  icon={Upload}
                  variant="secondary"
                  aria-label="Upload"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Icon Button Sizes</h3>
              <div className="flex items-center gap-4">
                <IconButton icon={Check} size="sm" aria-label="Small" />
                <IconButton icon={Check} size="md" aria-label="Medium" />
                <IconButton icon={Check} size="lg" aria-label="Large" />
              </div>
            </div>
          </div>
        )

      case 'menus':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Dropdown Menu</h3>
              <Menu>
                <MenuTrigger asChild>
                  <Button variant="outline">Open Menu</Button>
                </MenuTrigger>
                <MenuContent>
                  <MenuLabel>My Account</MenuLabel>
                  <MenuItem>Profile</MenuItem>
                  <MenuItem>Settings</MenuItem>
                  <MenuSeparator />
                  <MenuItem destructive>Delete Account</MenuItem>
                </MenuContent>
              </Menu>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Context Menu</h3>
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    Right-click here
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent>
                  <ContextMenuItem>Copy</ContextMenuItem>
                  <ContextMenuItem>Cut</ContextMenuItem>
                  <ContextMenuItem>Paste</ContextMenuItem>
                  <ContextMenuSeparator />
                  <ContextMenuItem>Delete</ContextMenuItem>
                </ContextMenuContent>
              </ContextMenu>
            </div>
          </div>
        )

      case 'inputs':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Input Variants</h3>
              <div className="space-y-4 max-w-md">
                <Input placeholder="Default input" />
                <Input placeholder="With icon" icon={Search} />
                <Input placeholder="Disabled input" disabled />
                <Input
                  placeholder="With error"
                  error="This field is required"
                />
              </div>
            </div>
          </div>
        )

      case 'select':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Component</h3>
              <div className="max-w-md">
                <Select
                  options={[
                    { value: 'option1', label: 'Option 1' },
                    { value: 'option2', label: 'Option 2' },
                    { value: 'option3', label: 'Option 3' },
                  ]}
                  placeholder="Select an option"
                />
              </div>
            </div>
          </div>
        )

      case 'checkbox-radio':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Checkbox</h3>
              <div className="space-y-4">
                <Checkbox
                  checked={checkboxChecked}
                  onCheckedChange={setCheckboxChecked}
                  label="Accept terms and conditions"
                />
                <Checkbox disabled label="Disabled checkbox" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Radio Group</h3>
              <RadioGroup value={radioValue} onValueChange={setRadioValue}>
                <Radio value="option1" label="Option 1" />
                <Radio value="option2" label="Option 2" />
                <Radio value="option3" label="Option 3" />
              </RadioGroup>
            </div>
          </div>
        )

      case 'textarea':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Textarea</h3>
              <div className="max-w-md space-y-4">
                <Textarea placeholder="Enter your message..." />
                <Textarea
                  placeholder="With error"
                  error="Message is too short"
                />
                <Textarea placeholder="Disabled" disabled />
              </div>
            </div>
          </div>
        )

      case 'switch':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Switch Component</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Switch
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                    aria-label="Toggle feature"
                  />
                  <span>Enable notifications</span>
                </div>
                <div className="flex items-center gap-4">
                  <Switch disabled aria-label="Disabled switch" />
                  <span className="text-gray-500">Disabled switch</span>
                </div>
              </div>
            </div>
          </div>
        )

      case 'cards':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Card Examples</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Card Title</CardTitle>
                    <CardDescription>
                      Card description goes here
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>
                      This is the card content. You can put any content here.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button>Action</Button>
                  </CardFooter>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Feature Card</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Feature one included</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                        <span>Feature two included</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'table':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Table Component</h3>
              <Table>
                <TableCaption>A list of recent transactions</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead align="right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell>INV001</TableCell>
                    <TableCell>
                      <Badge variant="success">Paid</Badge>
                    </TableCell>
                    <TableCell>Credit Card</TableCell>
                    <TableCell align="right">$250.00</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>INV002</TableCell>
                    <TableCell>
                      <Badge variant="warning">Pending</Badge>
                    </TableCell>
                    <TableCell>PayPal</TableCell>
                    <TableCell align="right">$150.00</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          </div>
        )

      case 'list':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">List Components</h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Unordered List</h4>
                  <List>
                    <ListItem>First item</ListItem>
                    <ListItem>Second item</ListItem>
                    <ListItem>Third item</ListItem>
                  </List>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Checklist</h4>
                  <Checklist>
                    <ChecklistItem checked>Completed task</ChecklistItem>
                    <ChecklistItem>Pending task</ChecklistItem>
                    <ChecklistItem>Future task</ChecklistItem>
                  </Checklist>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description List</h4>
                  <DescriptionList>
                    <DescriptionListItem term="Name" description="John Doe" />
                    <DescriptionListItem
                      term="Email"
                      description="john@example.com"
                    />
                    <DescriptionListItem
                      term="Role"
                      description="Administrator"
                    />
                  </DescriptionList>
                </div>
              </div>
            </div>
          </div>
        )

      case 'stats':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Stat Components</h3>
              <StatGroup>
                <StatCard
                  label="Total Revenue"
                  value="$45,231"
                  change={{ type: 'increase', value: '+20.1%' }}
                  helpText="From last month"
                />
                <StatCard
                  label="Active Users"
                  value="2,338"
                  change={{ type: 'decrease', value: '-4.1%' }}
                  helpText="From last week"
                />
                <StatCard
                  label="Conversion Rate"
                  value="3.2%"
                  change={{ type: 'increase', value: '+0.8%' }}
                />
              </StatGroup>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Custom Stats</h3>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-6">
                    <Stat>
                      <StatLabel>Downloads</StatLabel>
                      <StatNumber>1,234</StatNumber>
                      <StatHelpText>
                        <StatArrow type="increase" />
                        23% increase
                      </StatHelpText>
                    </Stat>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        )

      case 'badges':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Badge Variants</h3>
              <div className="flex flex-wrap gap-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="info">Info</Badge>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Tags</h3>
              <div className="flex flex-wrap gap-2">
                <Tag>React</Tag>
                <Tag removable>TypeScript</Tag>
                <Tag color="primary">Next.js</Tag>
                <Tag color="success">Active</Tag>
              </div>
            </div>
          </div>
        )

      case 'avatars':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Avatar Sizes</h3>
              <div className="flex items-center gap-4">
                <Avatar src="/api/placeholder/32/32" alt="User" size="sm" />
                <Avatar src="/api/placeholder/40/40" alt="User" size="md" />
                <Avatar src="/api/placeholder/48/48" alt="User" size="lg" />
                <Avatar src="/api/placeholder/64/64" alt="User" size="xl" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Avatar Fallbacks</h3>
              <div className="flex items-center gap-4">
                <Avatar fallback="JD" />
                <Avatar
                  fallback="AB"
                  className="bg-primary-100 text-primary-700"
                />
                <Avatar>
                  <Info className="h-6 w-6" />
                </Avatar>
              </div>
            </div>
          </div>
        )

      case 'alerts':
        return (
          <div className="space-y-4">
            <Alert variant="default">
              <AlertTitle>Default Alert</AlertTitle>
              <AlertDescription>
                This is a default alert message.
              </AlertDescription>
            </Alert>

            <Alert variant="info">
              <Info className="h-4 w-4" />
              <AlertTitle>Information</AlertTitle>
              <AlertDescription>
                This is an informational message.
              </AlertDescription>
            </Alert>

            <Alert variant="success">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Success!</AlertTitle>
              <AlertDescription>
                Your action was completed successfully.
              </AlertDescription>
            </Alert>

            <Alert variant="warning">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warning</AlertTitle>
              <AlertDescription>
                Please review this important information.
              </AlertDescription>
            </Alert>

            <Alert variant="error">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>
                Something went wrong. Please try again.
              </AlertDescription>
            </Alert>
          </div>
        )

      case 'progress':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Linear Progress</h3>
              <div className="space-y-4">
                <Progress value={25} label="Processing..." showValue />
                <Progress value={50} variant="success" />
                <Progress value={75} variant="warning" size="lg" />
                <Progress indeterminate variant="primary" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Circular Progress</h3>
              <div className="flex gap-4">
                <CircularProgress value={25} size="sm" />
                <CircularProgress value={50} size="md" showValue />
                <CircularProgress
                  value={75}
                  size="lg"
                  variant="success"
                  showValue
                />
                <CircularProgress indeterminate />
              </div>
            </div>
          </div>
        )

      case 'spinner':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Spinner Sizes</h3>
              <div className="flex items-center gap-4">
                <Spinner size="sm" />
                <Spinner size="md" />
                <Spinner size="lg" />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Spinner in Context</h3>
              <div className="flex items-center gap-2 text-gray-600">
                <Spinner size="sm" />
                <span>Loading data...</span>
              </div>
            </div>
          </div>
        )

      case 'tooltip':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tooltip Positions</h3>
              <TooltipProvider>
                <div className="flex gap-4">
                  <Tooltip content="Top tooltip" position="top">
                    <Button variant="outline">Top</Button>
                  </Tooltip>
                  <Tooltip content="Bottom tooltip" position="bottom">
                    <Button variant="outline">Bottom</Button>
                  </Tooltip>
                  <Tooltip content="Left tooltip" position="left">
                    <Button variant="outline">Left</Button>
                  </Tooltip>
                  <Tooltip content="Right tooltip" position="right">
                    <Button variant="outline">Right</Button>
                  </Tooltip>
                </div>
              </TooltipProvider>
            </div>
          </div>
        )

      case 'toast':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">
                Toast Notifications
              </h3>
              <div className="flex flex-wrap gap-4">
                <Button
                  onClick={() =>
                    toast({
                      title: 'Default toast',
                      description: 'This is a default toast message.',
                    })
                  }
                >
                  Default Toast
                </Button>
                <Button
                  variant="success"
                  onClick={() =>
                    toast({
                      title: 'Success!',
                      description: 'Action completed successfully.',
                      variant: 'success',
                    })
                  }
                >
                  Success Toast
                </Button>
                <Button
                  variant="destructive"
                  onClick={() =>
                    toast({
                      title: 'Error',
                      description: 'Something went wrong.',
                      variant: 'error',
                    })
                  }
                >
                  Error Toast
                </Button>
                <Button
                  variant="warning"
                  onClick={() =>
                    toast({
                      title: 'Warning',
                      description: 'Please review this action.',
                      variant: 'warning',
                      action: {
                        label: 'Undo',
                        onClick: () => console.log('Undo clicked'),
                      },
                    })
                  }
                >
                  Toast with Action
                </Button>
              </div>
            </div>
          </div>
        )

      case 'modal':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Modal Dialog</h3>
              <div className="flex gap-4">
                <Button onClick={modalExample.open}>Open Modal</Button>
                <Button variant="destructive" onClick={alertDialogExample.open}>
                  Open Alert Dialog
                </Button>
              </div>

              <Modal
                isOpen={modalExample.isOpen}
                onClose={modalExample.close}
                title="Modal Title"
                description="This is a modal description"
              >
                <ModalBody>
                  <p>
                    This is the modal content. You can put any content here
                    including forms, images, or other components.
                  </p>
                </ModalBody>
                <ModalFooter>
                  <Button variant="outline" onClick={modalExample.close}>
                    Cancel
                  </Button>
                  <Button onClick={modalExample.close}>Save Changes</Button>
                </ModalFooter>
              </Modal>

              <AlertDialog
                isOpen={alertDialogExample.isOpen}
                onClose={alertDialogExample.close}
                title="Are you sure?"
                message="This action cannot be undone. This will permanently delete your account and remove your data from our servers."
                variant="danger"
                onConfirm={() => {
                  console.log('Confirmed')
                  alertDialogExample.close()
                }}
              />
            </div>
          </div>
        )

      case 'drawer':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Drawer Component</h3>
              <div className="flex gap-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Drawer component implementation placeholder - This would show
                  a drawer dialog component.
                </p>
              </div>
            </div>
          </div>
        )

      case 'container':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Container</h3>
              <Container className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8">
                <p>
                  This content is wrapped in a Container component that provides
                  consistent max-width and padding.
                </p>
              </Container>
            </div>
          </div>
        )

      case 'grid':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Grid Layout</h3>
              <Grid cols={3} gap={4}>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 1
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 2
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 3
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 4
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 5
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                  Grid Item 6
                </div>
              </Grid>
            </div>
          </div>
        )

      case 'stack':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Stack Layout</h3>
              <div className="grid gap-8 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-2">Vertical Stack</h4>
                  <Stack spacing={4}>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 1
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 2
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 3
                    </div>
                  </Stack>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Horizontal Stack</h4>
                  <Stack direction="horizontal" spacing={4}>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 1
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 2
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 rounded p-4">
                      Item 3
                    </div>
                  </Stack>
                </div>
              </div>
            </div>
          </div>
        )

      case 'section':
        return (
          <div className="space-y-8">
            <Section>
              <Heading level={2}>Section Component</Heading>
              <Text>
                The Section component provides consistent spacing and structure
                for page sections. It helps maintain visual hierarchy and
                spacing throughout your application.
              </Text>
            </Section>
          </div>
        )

      case 'navbar':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Navbar Component</h3>
              <div className="border rounded-lg overflow-hidden">
                <Navbar>
                  <NavbarBrand>
                    <span className="font-bold text-xl">Brand</span>
                  </NavbarBrand>
                  <NavbarContent justify="center">
                    <NavbarItem active>Home</NavbarItem>
                    <NavbarItem>About</NavbarItem>
                    <NavbarItem>Services</NavbarItem>
                    <NavbarItem>Contact</NavbarItem>
                  </NavbarContent>
                  <NavbarActions>
                    <Button size="sm">Sign In</Button>
                  </NavbarActions>
                  <NavbarMenuToggle />
                </Navbar>
              </div>
            </div>
          </div>
        )

      case 'sidebar':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Sidebar Component</h3>
              <div className="border rounded-lg overflow-hidden h-96">
                <SidebarProvider>
                  <div className="flex h-full">
                    <Sidebar>
                      <SidebarHeader>
                        <div className="flex items-center justify-between">
                          <span className="font-bold">Menu</span>
                          <SidebarToggle />
                        </div>
                      </SidebarHeader>
                      <SidebarContent>
                        <SidebarGroup label="Main">
                          <SidebarItem active>Dashboard</SidebarItem>
                          <SidebarItem>Analytics</SidebarItem>
                          <SidebarItem badge="3">Messages</SidebarItem>
                        </SidebarGroup>
                        <SidebarGroup label="Settings">
                          <SidebarItem>Profile</SidebarItem>
                          <SidebarItem>Preferences</SidebarItem>
                        </SidebarGroup>
                      </SidebarContent>
                      <SidebarFooter>
                        <SidebarItem>Logout</SidebarItem>
                      </SidebarFooter>
                    </Sidebar>
                    <div className="flex-1 p-8">
                      <p>Main content area</p>
                    </div>
                  </div>
                </SidebarProvider>
              </div>
            </div>
          </div>
        )

      case 'tabs':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Tabs Component</h3>
              <Tabs defaultValue="tab1">
                <TabsList>
                  <TabsTrigger value="tab1">Tab 1</TabsTrigger>
                  <TabsTrigger value="tab2">Tab 2</TabsTrigger>
                  <TabsTrigger value="tab3">Tab 3</TabsTrigger>
                </TabsList>
                <TabsContent value="tab1">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 1 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for tab 1.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 2 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for tab 2.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
                <TabsContent value="tab3">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tab 3 Content</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p>This is the content for tab 3.</p>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )

      case 'breadcrumb':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Breadcrumb</h3>
              <Breadcrumb
                items={[
                  { label: 'Home', href: '/' },
                  { label: 'Products', href: '/products' },
                  { label: 'Product Details', current: true },
                ]}
              />
            </div>
          </div>
        )

      case 'pagination':
        return (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Pagination</h3>
              <Pagination
                currentPage={currentPage}
                totalPages={10}
                onPageChange={setCurrentPage}
              />
            </div>
          </div>
        )

      default:
        return <div>Select a component from the sidebar</div>
    }
  }

  return (
    <ToastProvider>
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
          <Container>
            <div className="py-6">
              <h1 className="text-2xl font-bold">Component Library</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Interactive demos of all UI components
              </p>
            </div>
          </Container>
        </div>

        <Container>
          <div className="py-8">
            {/* Component Display Area */}
            <Card>
              <CardContent className="p-8">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold capitalize">
                    {selectedTab.split('-').join(' ')}
                  </h2>
                </div>
                {renderComponentDemo()}
              </CardContent>
            </Card>
          </div>
        </Container>
      </div>
    </ToastProvider>
  )
}
