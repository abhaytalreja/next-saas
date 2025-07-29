'use client'

import React from 'react'
import { cn } from '@nextsaas/ui'

interface DashboardGridProps {
  children: React.ReactNode
  className?: string
}

export function DashboardGrid({ children, className }: DashboardGridProps) {
  return (
    <div 
      className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}
      data-testid="dashboard-grid"
    >
      {children}
    </div>
  )
}