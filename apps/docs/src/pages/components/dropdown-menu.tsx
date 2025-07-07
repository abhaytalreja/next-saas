import { 
  DropdownMenu, 
  DropdownTrigger, 
  DropdownContent, 
  DropdownItem, 
  DropdownCheckboxItem, 
  DropdownSeparator, 
  DropdownLabel 
} from '@nextsaas/ui'
import { Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Settings, User, LogOut, Mail, MessageSquare, Plus } from 'lucide-react'
import { useState } from 'react'

const BasicExample = () => (
  <DropdownMenu>
    <DropdownTrigger asChild>
      <Button variant="outline">Open</Button>
    </DropdownTrigger>
    <DropdownContent>
      <DropdownItem>
        <User className="mr-2 h-4 w-4" />
        Profile
      </DropdownItem>
      <DropdownItem>
        <Settings className="mr-2 h-4 w-4" />
        Settings
      </DropdownItem>
      <DropdownSeparator />
      <DropdownItem destructive>
        <LogOut className="mr-2 h-4 w-4" />
        Logout
      </DropdownItem>
    </DropdownContent>
  </DropdownMenu>
)

const CheckboxExample = () => {
  const [notifications, setNotifications] = useState(true)
  const [newsletter, setNewsletter] = useState(false)

  return (
    <DropdownMenu>
      <DropdownTrigger asChild>
        <Button variant="outline">Preferences</Button>
      </DropdownTrigger>
      <DropdownContent>
        <DropdownLabel>Notifications</DropdownLabel>
        <DropdownCheckboxItem 
          checked={notifications} 
          onCheckedChange={setNotifications}
        >
          <Mail className="mr-2 h-4 w-4" />
          Email notifications
        </DropdownCheckboxItem>
        <DropdownCheckboxItem 
          checked={newsletter} 
          onCheckedChange={setNewsletter}
        >
          <MessageSquare className="mr-2 h-4 w-4" />
          Newsletter
        </DropdownCheckboxItem>
      </DropdownContent>
    </DropdownMenu>
  )
}

const examples = [
  {
    title: 'Basic Dropdown',
    code: `<DropdownMenu>
  <DropdownTrigger asChild>
    <Button variant="outline">Open</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownItem>
      <User className="mr-2 h-4 w-4" />
      Profile
    </DropdownItem>
    <DropdownItem>
      <Settings className="mr-2 h-4 w-4" />
      Settings
    </DropdownItem>
    <DropdownSeparator />
    <DropdownItem destructive>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </DropdownItem>
  </DropdownContent>
</DropdownMenu>`,
    component: <BasicExample />,
  },
  {
    title: 'With Checkbox Items',
    code: `const [notifications, setNotifications] = useState(true)
const [newsletter, setNewsletter] = useState(false)

<DropdownMenu>
  <DropdownTrigger asChild>
    <Button variant="outline">Preferences</Button>
  </DropdownTrigger>
  <DropdownContent>
    <DropdownLabel>Notifications</DropdownLabel>
    <DropdownCheckboxItem 
      checked={notifications} 
      onCheckedChange={setNotifications}
    >
      <Mail className="mr-2 h-4 w-4" />
      Email notifications
    </DropdownCheckboxItem>
    <DropdownCheckboxItem 
      checked={newsletter} 
      onCheckedChange={setNewsletter}
    >
      <MessageSquare className="mr-2 h-4 w-4" />
      Newsletter
    </DropdownCheckboxItem>
  </DropdownContent>
</DropdownMenu>`,
    component: <CheckboxExample />,
  },
  {
    title: 'Alignment Options',
    code: `<div className="flex space-x-4">
  <DropdownMenu>
    <DropdownTrigger asChild>
      <Button variant="outline">Align Start</Button>
    </DropdownTrigger>
    <DropdownContent align="start">
      <DropdownItem>Item 1</DropdownItem>
      <DropdownItem>Item 2</DropdownItem>
      <DropdownItem>Item 3</DropdownItem>
    </DropdownContent>
  </DropdownMenu>

  <DropdownMenu>
    <DropdownTrigger asChild>
      <Button variant="outline">Align Center</Button>
    </DropdownTrigger>
    <DropdownContent align="center">
      <DropdownItem>Item 1</DropdownItem>
      <DropdownItem>Item 2</DropdownItem>
      <DropdownItem>Item 3</DropdownItem>
    </DropdownContent>
  </DropdownMenu>

  <DropdownMenu>
    <DropdownTrigger asChild>
      <Button variant="outline">Align End</Button>
    </DropdownTrigger>
    <DropdownContent align="end">
      <DropdownItem>Item 1</DropdownItem>
      <DropdownItem>Item 2</DropdownItem>
      <DropdownItem>Item 3</DropdownItem>
    </DropdownContent>
  </DropdownMenu>
</div>`,
    component: (
      <div className="flex space-x-4">
        <DropdownMenu>
          <DropdownTrigger asChild>
            <Button variant="outline">Align Start</Button>
          </DropdownTrigger>
          <DropdownContent align="start">
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem>Item 3</DropdownItem>
          </DropdownContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownTrigger asChild>
            <Button variant="outline">Align Center</Button>
          </DropdownTrigger>
          <DropdownContent align="center">
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem>Item 3</DropdownItem>
          </DropdownContent>
        </DropdownMenu>

        <DropdownMenu>
          <DropdownTrigger asChild>
            <Button variant="outline">Align End</Button>
          </DropdownTrigger>
          <DropdownContent align="end">
            <DropdownItem>Item 1</DropdownItem>
            <DropdownItem>Item 2</DropdownItem>
            <DropdownItem>Item 3</DropdownItem>
          </DropdownContent>
        </DropdownMenu>
      </div>
    ),
  },
]

export default function DropdownMenuPage() {
  return (
    <ComponentLayout
      title="Dropdown Menu"
      description="Displays a menu to the user — such as a set of actions or functions — triggered by a button."
      examples={examples}
    />
  )
}