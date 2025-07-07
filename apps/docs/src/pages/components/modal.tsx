import { Modal, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react'

const BasicExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Open Basic Modal
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Modal</h2>
          <p className="text-gray-600 mb-6">
            This is a basic modal dialog. It provides an overlay that focuses user attention on specific content or actions.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setIsOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const SizesExample = () => {
  const [openModal, setOpenModal] = useState<string | null>(null)

  const modalSizes = [
    { size: 'sm' as const, label: 'Small' },
    { size: 'md' as const, label: 'Medium' },
    { size: 'lg' as const, label: 'Large' },
    { size: 'xl' as const, label: 'Extra Large' },
    { size: 'full' as const, label: 'Full Screen' }
  ]

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {modalSizes.map(({ size, label }) => (
          <Button key={size} onClick={() => setOpenModal(size)}>
            {label} Modal
          </Button>
        ))}
      </div>
      
      {modalSizes.map(({ size, label }) => (
        <Modal
          key={size}
          size={size}
          isOpen={openModal === size}
          onClose={() => setOpenModal(null)}
        >
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{label} Modal</h2>
            <p className="text-gray-600 mb-6">
              This is a {label.toLowerCase()} modal. The size affects the width and max-width of the modal content.
            </p>
            <Button onClick={() => setOpenModal(null)}>
              Close
            </Button>
          </div>
        </Modal>
      ))}
    </>
  )
}

const ConfirmationExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  const handleDelete = () => {
    console.log('Item deleted')
    setIsOpen(false)
  }

  return (
    <>
      <Button variant="destructive" onClick={() => setIsOpen(true)}>
        Delete Item
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
        <div className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this item? This action cannot be undone and will permanently remove the data.
          </p>
          
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

const FormModalExample = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    setIsOpen(false)
    setFormData({ name: '', email: '', message: '' })
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Contact Form
      </Button>
      
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
            <button 
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                rows={4}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your message..."
              />
            </div>
            
            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Send Message
              </Button>
            </div>
          </form>
        </div>
      </Modal>
    </>
  )
}

const NotificationModalExample = () => {
  const [openModal, setOpenModal] = useState<string | null>(null)

  const notifications = [
    {
      type: 'success',
      icon: CheckCircle,
      title: 'Success!',
      message: 'Your operation completed successfully.',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      type: 'error',
      icon: AlertTriangle,
      title: 'Error Occurred',
      message: 'Something went wrong. Please try again.',
      iconColor: 'text-red-600',
      bgColor: 'bg-red-100'
    },
    {
      type: 'info',
      icon: Info,
      title: 'Information',
      message: 'Here is some important information for you.',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100'
    }
  ]

  return (
    <>
      <div className="flex gap-2">
        {notifications.map((notification) => (
          <Button 
            key={notification.type}
            onClick={() => setOpenModal(notification.type)}
          >
            {notification.title}
          </Button>
        ))}
      </div>
      
      {notifications.map((notification) => (
        <Modal
          key={notification.type}
          isOpen={openModal === notification.type}
          onClose={() => setOpenModal(null)}
        >
          <div className="p-6 text-center">
            <div className={`w-16 h-16 ${notification.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <notification.icon className={`w-8 h-8 ${notification.iconColor}`} />
            </div>
            
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {notification.title}
            </h2>
            
            <p className="text-gray-600 mb-6">
              {notification.message}
            </p>
            
            <Button onClick={() => setOpenModal(null)}>
              OK
            </Button>
          </div>
        </Modal>
      ))}
    </>
  )
}

const CustomOverlayExample = () => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>
        Custom Overlay
      </Button>
      
      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)}
        closeOnOverlayClick={false}
        overlayClassName="bg-black bg-opacity-70"
      >
        <div className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Overlay</h2>
          <p className="text-gray-600 mb-6">
            This modal has a custom dark overlay and cannot be closed by clicking outside. 
            You must use the close button.
          </p>
          <Button onClick={() => setIsOpen(false)}>
            Close Modal
          </Button>
        </div>
      </Modal>
    </>
  )
}

const examples = [
  {
    title: 'Basic Modal',
    code: `const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>
    Open Basic Modal
  </Button>
  
  <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Basic Modal</h2>
      <p className="text-gray-600 mb-6">
        This is a basic modal dialog. It provides an overlay that focuses 
        user attention on specific content or actions.
      </p>
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => setIsOpen(false)}>
          Confirm
        </Button>
      </div>
    </div>
  </Modal>
</>`,
    component: <BasicExample />,
  },
  {
    title: 'Modal Sizes',
    code: `const [openModal, setOpenModal] = useState(null)

<>
  <Button onClick={() => setOpenModal('sm')}>Small Modal</Button>
  <Button onClick={() => setOpenModal('md')}>Medium Modal</Button>
  <Button onClick={() => setOpenModal('lg')}>Large Modal</Button>
  <Button onClick={() => setOpenModal('xl')}>Extra Large Modal</Button>
  <Button onClick={() => setOpenModal('full')}>Full Screen Modal</Button>
  
  <Modal
    size="lg"
    isOpen={openModal === 'lg'}
    onClose={() => setOpenModal(null)}
  >
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Large Modal</h2>
      <p className="text-gray-600 mb-6">
        This is a large modal with more space for content.
      </p>
      <Button onClick={() => setOpenModal(null)}>Close</Button>
    </div>
  </Modal>
</>`,
    component: <SizesExample />,
  },
  {
    title: 'Confirmation Dialog',
    code: `const [isOpen, setIsOpen] = useState(false)

const handleDelete = () => {
  console.log('Item deleted')
  setIsOpen(false)
}

<>
  <Button variant="destructive" onClick={() => setIsOpen(true)}>
    Delete Item
  </Button>
  
  <Modal isOpen={isOpen} onClose={() => setIsOpen(false)}>
    <div className="p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-5 h-5 text-red-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Confirm Deletion</h2>
      </div>
      
      <p className="text-gray-600 mb-6">
        Are you sure you want to delete this item? This action cannot be undone.
      </p>
      
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={handleDelete}>
          Delete
        </Button>
      </div>
    </div>
  </Modal>
</>`,
    component: <ConfirmationExample />,
  },
  {
    title: 'Form Modal',
    code: `const [isOpen, setIsOpen] = useState(false)
const [formData, setFormData] = useState({ name: '', email: '', message: '' })

const handleSubmit = (e) => {
  e.preventDefault()
  console.log('Form submitted:', formData)
  setIsOpen(false)
}

<>
  <Button onClick={() => setIsOpen(true)}>Contact Form</Button>
  
  <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} size="lg">
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Contact Us</h2>
        <button onClick={() => setIsOpen(false)}>
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Name *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            placeholder="Your name"
          />
        </div>
        
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Send Message
          </Button>
        </div>
      </form>
    </div>
  </Modal>
</>`,
    component: <FormModalExample />,
  },
  {
    title: 'Notification Modals',
    code: `const [openModal, setOpenModal] = useState(null)

<>
  <Button onClick={() => setOpenModal('success')}>Success</Button>
  <Button onClick={() => setOpenModal('error')}>Error</Button>
  <Button onClick={() => setOpenModal('info')}>Info</Button>
  
  <Modal isOpen={openModal === 'success'} onClose={() => setOpenModal(null)}>
    <div className="p-6 text-center">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Success!</h2>
      <p className="text-gray-600 mb-6">Your operation completed successfully.</p>
      
      <Button onClick={() => setOpenModal(null)}>OK</Button>
    </div>
  </Modal>
</>`,
    component: <NotificationModalExample />,
  },
  {
    title: 'Custom Overlay',
    code: `const [isOpen, setIsOpen] = useState(false)

<>
  <Button onClick={() => setIsOpen(true)}>Custom Overlay</Button>
  
  <Modal 
    isOpen={isOpen} 
    onClose={() => setIsOpen(false)}
    closeOnOverlayClick={false}
    overlayClassName="bg-black bg-opacity-70"
  >
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Custom Overlay</h2>
      <p className="text-gray-600 mb-6">
        This modal has a custom dark overlay and cannot be closed by clicking outside.
      </p>
      <Button onClick={() => setIsOpen(false)}>Close Modal</Button>
    </div>
  </Modal>
</>`,
    component: <CustomOverlayExample />,
  },
]

export default function ModalPage() {
  return (
    <ComponentLayout
      title="Modal"
      description="A dialog component that displays content in an overlay, focusing user attention on specific tasks or information while blocking interaction with the background."
      examples={examples}
    />
  )
}