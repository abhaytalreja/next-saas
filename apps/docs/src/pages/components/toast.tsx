import { Toast, Button } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { useState } from 'react'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'

const BasicExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string, message: string}>>([])

  const showToast = () => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message: 'This is a basic toast message!' }])
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <>
      <Button onClick={showToast}>
        Show Toast
      </Button>
      
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast key={toast.id} onClose={() => removeToast(toast.id)}>
            {toast.message}
          </Toast>
        ))}
      </div>
    </>
  )
}

const VariantsExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string, variant: string, message: string, icon?: React.ComponentType}>>([])

  const variants = [
    { variant: 'default', message: 'Default toast message', icon: Info },
    { variant: 'success', message: 'Operation completed successfully!', icon: CheckCircle },
    { variant: 'error', message: 'An error occurred. Please try again.', icon: XCircle },
    { variant: 'warning', message: 'Please review your settings.', icon: AlertTriangle },
  ]

  const showToast = (variant: any) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, ...variant }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 4000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {variants.map((variant) => (
          <Button 
            key={variant.variant}
            onClick={() => showToast(variant)}
            variant={variant.variant === 'error' ? 'destructive' : 'outline'}
          >
            {variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)} Toast
          </Button>
        ))}
      </div>
      
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            variant={toast.variant as any}
            icon={toast.icon}
            onClose={() => removeToast(toast.id)}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </>
  )
}

const PositionsExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string, position: string, message: string}>>([])

  const positions = [
    { position: 'top-right', label: 'Top Right' },
    { position: 'top-left', label: 'Top Left' },
    { position: 'bottom-right', label: 'Bottom Right' },
    { position: 'bottom-left', label: 'Bottom Left' },
    { position: 'top-center', label: 'Top Center' },
    { position: 'bottom-center', label: 'Bottom Center' },
  ]

  const showToast = (position: any) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { 
      id, 
      position: position.position, 
      message: `Toast from ${position.label}!` 
    }])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id))
    }, 3000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const getPositionClasses = (position: string) => {
    switch (position) {
      case 'top-right': return 'fixed top-4 right-4'
      case 'top-left': return 'fixed top-4 left-4'
      case 'bottom-right': return 'fixed bottom-4 right-4'
      case 'bottom-left': return 'fixed bottom-4 left-4'
      case 'top-center': return 'fixed top-4 left-1/2 transform -translate-x-1/2'
      case 'bottom-center': return 'fixed bottom-4 left-1/2 transform -translate-x-1/2'
      default: return 'fixed top-4 right-4'
    }
  }

  // Group toasts by position
  const toastsByPosition = toasts.reduce((acc, toast) => {
    if (!acc[toast.position]) acc[toast.position] = []
    acc[toast.position].push(toast)
    return acc
  }, {} as Record<string, typeof toasts>)

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {positions.map((position) => (
          <Button 
            key={position.position}
            onClick={() => showToast(position)}
            variant="outline"
            size="sm"
          >
            {position.label}
          </Button>
        ))}
      </div>
      
      {Object.entries(toastsByPosition).map(([position, positionToasts]) => (
        <div key={position} className={`${getPositionClasses(position)} space-y-2 z-50`}>
          {positionToasts.map((toast) => (
            <Toast key={toast.id} onClose={() => removeToast(toast.id)}>
              {toast.message}
            </Toast>
          ))}
        </div>
      ))}
    </>
  )
}

const ActionToastExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string, message: string, action?: React.ReactNode}>>([])

  const showToast = (withAction = false) => {
    const id = Date.now().toString()
    const toast = {
      id,
      message: withAction ? 'File deleted successfully' : 'Changes saved!',
      action: withAction ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => {
            console.log('Undo action triggered')
            removeToast(id)
          }}
        >
          Undo
        </Button>
      ) : undefined
    }
    
    setToasts(prev => [...prev, toast])
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 5000)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => showToast(false)}>
          Simple Toast
        </Button>
        <Button onClick={() => showToast(true)}>
          Toast with Action
        </Button>
      </div>
      
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            onClose={() => removeToast(toast.id)}
            action={toast.action}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </>
  )
}

const PersistentExample = () => {
  const [toasts, setToasts] = useState<Array<{id: string, message: string, persistent?: boolean}>>([])

  const showToast = (persistent = false) => {
    const id = Date.now().toString()
    const toast = {
      id,
      message: persistent 
        ? 'This toast will stay until manually closed' 
        : 'This toast will auto-dismiss in 3 seconds',
      persistent
    }
    
    setToasts(prev => [...prev, toast])
    
    if (!persistent) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id))
      }, 3000)
    }
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => showToast(false)}>
          Auto-dismiss Toast
        </Button>
        <Button onClick={() => showToast(true)}>
          Persistent Toast
        </Button>
      </div>
      
      <div className="fixed top-4 right-4 space-y-2 z-50">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            onClose={() => removeToast(toast.id)}
            closable={toast.persistent}
          >
            {toast.message}
          </Toast>
        ))}
      </div>
    </>
  )
}

const ToastManagerExample = () => {
  const [toasts, setToasts] = useState<Array<{
    id: string
    title?: string
    message: string
    variant: string
    icon?: React.ComponentType
    duration?: number
  }>>([])

  const addToast = (toast: Omit<typeof toasts[0], 'id'>) => {
    const id = Date.now().toString()
    const newToast = { id, ...toast }
    setToasts(prev => [...prev, newToast])
    
    const duration = toast.duration || 4000
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, duration)
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const clearAllToasts = () => {
    setToasts([])
  }

  const examples = [
    {
      label: 'Success Notification',
      toast: {
        variant: 'success',
        icon: CheckCircle,
        title: 'Success!',
        message: 'Your profile has been updated successfully.',
        duration: 3000
      }
    },
    {
      label: 'Error Notification',
      toast: {
        variant: 'error',
        icon: XCircle,
        title: 'Error',
        message: 'Failed to save changes. Please try again.',
        duration: 5000
      }
    },
    {
      label: 'Warning',
      toast: {
        variant: 'warning',
        icon: AlertTriangle,
        title: 'Warning',
        message: 'Your session will expire in 5 minutes.',
        duration: 6000
      }
    }
  ]

  return (
    <>
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {examples.map((example, index) => (
            <Button 
              key={index}
              onClick={() => addToast(example.toast)}
              variant="outline"
            >
              {example.label}
            </Button>
          ))}
        </div>
        
        {toasts.length > 0 && (
          <Button onClick={clearAllToasts} variant="destructive" size="sm">
            Clear All ({toasts.length})
          </Button>
        )}
      </div>
      
      <div className="fixed top-4 right-4 space-y-2 z-50 max-w-sm">
        {toasts.map((toast) => (
          <Toast 
            key={toast.id} 
            variant={toast.variant as any}
            icon={toast.icon}
            onClose={() => removeToast(toast.id)}
          >
            <div>
              {toast.title && (
                <div className="font-medium mb-1">{toast.title}</div>
              )}
              <div className={toast.title ? 'text-sm' : ''}>{toast.message}</div>
            </div>
          </Toast>
        ))}
      </div>
    </>
  )
}

const examples = [
  {
    title: 'Basic Toast',
    code: `const [toasts, setToasts] = useState([])

const showToast = () => {
  const id = Date.now().toString()
  setToasts(prev => [...prev, { id, message: 'This is a basic toast message!' }])
  
  // Auto-remove after 3 seconds
  setTimeout(() => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, 3000)
}

const removeToast = (id) => {
  setToasts(prev => prev.filter(toast => toast.id !== id))
}

<>
  <Button onClick={showToast}>Show Toast</Button>
  
  <div className="fixed top-4 right-4 space-y-2 z-50">
    {toasts.map((toast) => (
      <Toast key={toast.id} onClose={() => removeToast(toast.id)}>
        {toast.message}
      </Toast>
    ))}
  </div>
</>`,
    component: <BasicExample />,
  },
  {
    title: 'Toast Variants',
    code: `const variants = [
  { variant: 'default', message: 'Default toast message', icon: Info },
  { variant: 'success', message: 'Operation completed successfully!', icon: CheckCircle },
  { variant: 'error', message: 'An error occurred. Please try again.', icon: XCircle },
  { variant: 'warning', message: 'Please review your settings.', icon: AlertTriangle },
]

<div className="flex flex-wrap gap-2">
  {variants.map((variant) => (
    <Button onClick={() => showToast(variant)}>
      {variant.variant.charAt(0).toUpperCase() + variant.variant.slice(1)} Toast
    </Button>
  ))}
</div>

<Toast 
  variant="success"
  icon={CheckCircle}
  onClose={() => removeToast(toast.id)}
>
  Operation completed successfully!
</Toast>`,
    component: <VariantsExample />,
  },
  {
    title: 'Different Positions',
    code: `const positions = [
  { position: 'top-right', label: 'Top Right' },
  { position: 'top-left', label: 'Top Left' },
  { position: 'bottom-right', label: 'Bottom Right' },
  { position: 'bottom-left', label: 'Bottom Left' },
  { position: 'top-center', label: 'Top Center' },
  { position: 'bottom-center', label: 'Bottom Center' },
]

const getPositionClasses = (position) => {
  switch (position) {
    case 'top-right': return 'fixed top-4 right-4'
    case 'top-left': return 'fixed top-4 left-4'
    case 'bottom-right': return 'fixed bottom-4 right-4'
    case 'bottom-left': return 'fixed bottom-4 left-4'
    case 'top-center': return 'fixed top-4 left-1/2 transform -translate-x-1/2'
    case 'bottom-center': return 'fixed bottom-4 left-1/2 transform -translate-x-1/2'
  }
}

<div className={getPositionClasses(position)}>
  <Toast onClose={() => removeToast(toast.id)}>
    Toast from {position}!
  </Toast>
</div>`,
    component: <PositionsExample />,
  },
  {
    title: 'Toast with Actions',
    code: `const showToast = (withAction = false) => {
  const toast = {
    id: Date.now().toString(),
    message: withAction ? 'File deleted successfully' : 'Changes saved!',
    action: withAction ? (
      <Button 
        variant="outline" 
        size="sm"
        onClick={() => {
          console.log('Undo action triggered')
          removeToast(toast.id)
        }}
      >
        Undo
      </Button>
    ) : undefined
  }
  
  setToasts(prev => [...prev, toast])
}

<Toast 
  onClose={() => removeToast(toast.id)}
  action={
    <Button variant="outline" size="sm" onClick={handleUndo}>
      Undo
    </Button>
  }
>
  File deleted successfully
</Toast>`,
    component: <ActionToastExample />,
  },
  {
    title: 'Persistent vs Auto-dismiss',
    code: `const showToast = (persistent = false) => {
  const toast = {
    id: Date.now().toString(),
    message: persistent 
      ? 'This toast will stay until manually closed' 
      : 'This toast will auto-dismiss in 3 seconds',
    persistent
  }
  
  setToasts(prev => [...prev, toast])
  
  if (!persistent) {
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id))
    }, 3000)
  }
}

<Toast 
  onClose={() => removeToast(toast.id)}
  closable={toast.persistent}
>
  {toast.message}
</Toast>`,
    component: <PersistentExample />,
  },
  {
    title: 'Toast Manager',
    code: `const addToast = (toast) => {
  const id = Date.now().toString()
  const newToast = { id, ...toast }
  setToasts(prev => [...prev, newToast])
  
  const duration = toast.duration || 4000
  setTimeout(() => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, duration)
}

const examples = [
  {
    variant: 'success',
    icon: CheckCircle,
    title: 'Success!',
    message: 'Your profile has been updated successfully.',
    duration: 3000
  },
  {
    variant: 'error',
    icon: XCircle,
    title: 'Error',
    message: 'Failed to save changes. Please try again.',
    duration: 5000
  }
]

<Toast 
  variant="success"
  icon={CheckCircle}
  onClose={() => removeToast(toast.id)}
>
  <div>
    <div className="font-medium mb-1">Success!</div>
    <div className="text-sm">Your profile has been updated successfully.</div>
  </div>
</Toast>`,
    component: <ToastManagerExample />,
  },
]

export default function ToastPage() {
  return (
    <ComponentLayout
      title="Toast"
      description="A lightweight notification component that appears temporarily to provide feedback about user actions or system events."
      examples={examples}
    />
  )
}