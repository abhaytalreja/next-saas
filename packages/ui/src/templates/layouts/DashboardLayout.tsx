import { forwardRef, useState, useEffect } from 'react'
import { Menu, X, Bell, Search, Settings, User, ChevronLeft, Home } from 'lucide-react'
import { cn } from '../../lib/utils'

export interface SidebarItem {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  href?: string
  active?: boolean
  badge?: string | number
  children?: SidebarItem[]
  onClick?: () => void
  disabled?: boolean
}

export interface BreadcrumbItem {
  label: string
  href?: string
  onClick?: () => void
}

export interface DashboardLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  
  // Header
  brand?: {
    name: string
    logo?: string | React.ComponentType<{ className?: string }>
    href?: string
  }
  user?: {
    name: string
    email: string
    avatar?: string
    initials?: string
  }
  notifications?: {
    count: number
    onClick: () => void
  }
  search?: {
    placeholder?: string
    onSearch: (query: string) => void
  }
  
  // Sidebar
  sidebarItems: SidebarItem[]
  sidebarCollapsed?: boolean
  onSidebarCollapse?: (collapsed: boolean) => void
  sidebarFooter?: React.ReactNode
  
  // Content
  pageTitle?: string
  pageSubtitle?: string
  breadcrumbs?: BreadcrumbItem[]
  headerActions?: React.ReactNode
  
  // Layout options
  variant?: 'default' | 'fluid' | 'boxed'
  sidebarVariant?: 'default' | 'floating' | 'minimal'
  headerSticky?: boolean
  showMobileSidebar?: boolean
  onMobileSidebarChange?: (show: boolean) => void
}

export const DashboardLayout = forwardRef<HTMLDivElement, DashboardLayoutProps>(
  ({ 
    children,
    
    // Header props
    brand,
    user,
    notifications,
    search,
    
    // Sidebar props
    sidebarItems,
    sidebarCollapsed = false,
    onSidebarCollapse,
    sidebarFooter,
    
    // Content props
    pageTitle,
    pageSubtitle,
    breadcrumbs,
    headerActions,
    
    // Layout props
    variant = 'default',
    sidebarVariant = 'default',
    headerSticky = true,
    showMobileSidebar = false,
    onMobileSidebarChange,
    
    className,
    ...props 
  }, ref) => {
    const [internalMobileSidebar, setInternalMobileSidebar] = useState(false)
    const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

    const mobileOpen = showMobileSidebar ?? internalMobileSidebar
    const setMobileOpen = onMobileSidebarChange ?? setInternalMobileSidebar

    // Close mobile sidebar on escape
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && mobileOpen) {
          setMobileOpen(false)
        }
      }

      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }, [mobileOpen, setMobileOpen])

    const toggleExpanded = (itemId: string) => {
      const newExpanded = new Set(expandedItems)
      if (newExpanded.has(itemId)) {
        newExpanded.delete(itemId)
      } else {
        newExpanded.add(itemId)
      }
      setExpandedItems(newExpanded)
    }

    const renderSidebarItem = (item: SidebarItem, level = 0) => {
      const hasChildren = item.children && item.children.length > 0
      const isExpanded = expandedItems.has(item.id)
      const ItemIcon = item.icon

      return (
        <div key={item.id}>
          <button
            onClick={() => {
              if (hasChildren) {
                toggleExpanded(item.id)
              } else {
                item.onClick?.()
                setMobileOpen(false)
              }
            }}
            disabled={item.disabled}
            className={cn(
              'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors',
              level > 0 && 'ml-6 pl-2',
              item.active 
                ? 'bg-primary text-primary-foreground' 
                : 'text-muted-foreground hover:text-foreground hover:bg-accent',
              item.disabled && 'opacity-50 cursor-not-allowed',
              sidebarCollapsed && level === 0 && 'justify-center px-2'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              {ItemIcon && (
                <ItemIcon className={cn(
                  'h-4 w-4 flex-shrink-0',
                  item.active && 'text-primary-foreground'
                )} />
              )}
              {!sidebarCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </div>

            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-medium text-primary-foreground min-w-[1.25rem]">
                    {item.badge}
                  </span>
                )}
                {hasChildren && (
                  <ChevronLeft className={cn(
                    'h-4 w-4 transition-transform',
                    isExpanded && 'rotate-90'
                  )} />
                )}
              </div>
            )}
          </button>

          {hasChildren && isExpanded && !sidebarCollapsed && (
            <div className="mt-1 space-y-1">
              {item.children!.map(child => renderSidebarItem(child, level + 1))}
            </div>
          )}
        </div>
      )
    }

    const renderBreadcrumbs = () => {
      if (!breadcrumbs || breadcrumbs.length === 0) return null

      return (
        <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
          <Home className="h-4 w-4" />
          {breadcrumbs.map((item, index) => (
            <div key={index} className="flex items-center">
              <span className="mx-2">/</span>
              {item.href || item.onClick ? (
                <button
                  onClick={() => item.onClick?.()}
                  className="hover:text-foreground transition-colors"
                >
                  {item.label}
                </button>
              ) : (
                <span className={index === breadcrumbs.length - 1 ? 'text-foreground font-medium' : ''}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </nav>
      )
    }

    const sidebarWidth = sidebarCollapsed ? 'w-16' : 'w-64'

    return (
      <div 
        ref={ref} 
        className={cn('min-h-screen bg-background', className)} 
        {...props}
      >
        {/* Mobile sidebar backdrop */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          'fixed top-0 left-0 z-50 h-full bg-card border-r border-border transition-transform duration-300',
          sidebarWidth,
          sidebarVariant === 'floating' && 'm-2 h-[calc(100vh-1rem)] rounded-lg shadow-lg',
          sidebarVariant === 'minimal' && 'border-0 bg-transparent',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0'
        )}>
          <div className="flex h-full flex-col">
            {/* Sidebar header */}
            <div className={cn(
              'flex items-center justify-between p-4 border-b border-border',
              sidebarCollapsed && 'justify-center'
            )}>
              {!sidebarCollapsed && brand && (
                <div className="flex items-center gap-2">
                  {typeof brand.logo === 'string' ? (
                    <img src={brand.logo} alt={brand.name} className="h-8 w-8" />
                  ) : brand.logo ? (
                    <brand.logo className="h-8 w-8" />
                  ) : null}
                  <span className="font-semibold">{brand.name}</span>
                </div>
              )}
              
              <button
                onClick={() => setMobileOpen(false)}
                className="lg:hidden p-1 hover:bg-accent rounded"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Sidebar navigation */}
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {sidebarItems.map(item => renderSidebarItem(item))}
            </nav>

            {/* Sidebar footer */}
            {sidebarFooter && !sidebarCollapsed && (
              <div className="p-4 border-t border-border">
                {sidebarFooter}
              </div>
            )}

            {/* Collapse toggle */}
            {onSidebarCollapse && (
              <div className="p-2 border-t border-border">
                <button
                  onClick={() => onSidebarCollapse(!sidebarCollapsed)}
                  className="w-full p-2 hover:bg-accent rounded-md transition-colors"
                >
                  <Menu className="h-4 w-4 mx-auto" />
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main content */}
        <div className={cn(
          'lg:ml-64',
          sidebarCollapsed && 'lg:ml-16'
        )}>
          {/* Header */}
          <header className={cn(
            'bg-background border-b border-border',
            headerSticky && 'sticky top-0 z-30'
          )}>
            <div className={cn(
              'flex items-center justify-between h-16 px-4 sm:px-6',
              variant === 'boxed' && 'max-w-7xl mx-auto'
            )}>
              {/* Left side */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setMobileOpen(true)}
                  className="lg:hidden p-2 hover:bg-accent rounded-md"
                >
                  <Menu className="h-5 w-5" />
                </button>

                <div>
                  {pageTitle && (
                    <h1 className="text-xl font-semibold">{pageTitle}</h1>
                  )}
                  {pageSubtitle && (
                    <p className="text-sm text-muted-foreground">{pageSubtitle}</p>
                  )}
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center gap-2">
                {search && (
                  <div className="hidden sm:block relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={search.placeholder || 'Search...'}
                      onChange={(e) => search.onSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 w-64 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                )}

                {headerActions}

                {notifications && (
                  <button
                    onClick={notifications.onClick}
                    className="relative p-2 hover:bg-accent rounded-md"
                  >
                    <Bell className="h-5 w-5" />
                    {notifications.count > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-xs font-medium text-destructive-foreground min-w-[1.25rem] h-5">
                        {notifications.count > 99 ? '99+' : notifications.count}
                      </span>
                    )}
                  </button>
                )}

                {user && (
                  <div className="flex items-center gap-2 p-1 hover:bg-accent rounded-md">
                    <div className="h-8 w-8 rounded-full bg-muted overflow-hidden">
                      {user.avatar ? (
                        <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-primary text-primary-foreground text-sm font-medium">
                          {user.initials || user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Breadcrumbs */}
            {breadcrumbs && (
              <div className={cn(
                'px-4 sm:px-6 py-2 border-t border-border',
                variant === 'boxed' && 'max-w-7xl mx-auto'
              )}>
                {renderBreadcrumbs()}
              </div>
            )}
          </header>

          {/* Page content */}
          <main className={cn(
            'p-4 sm:p-6',
            variant === 'boxed' && 'max-w-7xl mx-auto',
            variant === 'fluid' && 'p-0'
          )}>
            {children}
          </main>
        </div>
      </div>
    )
  }
)

DashboardLayout.displayName = 'DashboardLayout'