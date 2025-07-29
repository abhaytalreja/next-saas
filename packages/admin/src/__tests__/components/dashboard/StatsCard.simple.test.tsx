import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock UI components to avoid dependency issues
jest.mock('@nextsaas/ui', () => ({
  cn: jest.fn((...classes) => classes.filter(Boolean).join(' ')),
  Badge: (props) => (
    <span data-testid="badge" data-variant={props.variant} className={props.className}>
      {props.children}
    </span>
  )
}))

// Mock icons to avoid dependency issues
jest.mock('lucide-react', () => ({
  TrendingUp: (props) => <div data-testid="trending-up" className={props.className} />,
  TrendingDown: (props) => <div data-testid="trending-down" className={props.className} />,
  Minus: (props) => <div data-testid="minus" className={props.className} />,
  Wifi: (props) => <div data-testid="wifi" className={props.className} />,
  User: (props) => <div data-testid="user-icon" className={props.className} />
}))

// Import the component after mocks
import { StatsCard } from '../../../components/dashboard/StatsCard'
import { User } from 'lucide-react'

describe('StatsCard Basic Tests', () => {
  const defaultProps = {
    title: 'Total Users',
    value: 1000,
    icon: User
  }

  it('should render basic stats card', () => {
    render(<StatsCard {...defaultProps} />)
    
    expect(screen.getByText('Total Users')).toBeInTheDocument()
    expect(screen.getByText('1,000')).toBeInTheDocument()
    expect(screen.getByTestId('user-icon')).toBeInTheDocument()
  })

  it('should render with string value', () => {
    render(<StatsCard {...defaultProps} value="Active" />)
    
    expect(screen.getByText('Active')).toBeInTheDocument()
  })

  it('should render loading state', () => {
    const { container } = render(<StatsCard {...defaultProps} loading={true} />)
    
    expect(container.querySelector('.animate-pulse')).toBeInTheDocument()
    expect(screen.queryByText('Total Users')).not.toBeInTheDocument()
  })

  it('should format currency values', () => {
    render(<StatsCard {...defaultProps} value={50000} format="currency" />)
    
    expect(screen.getByText('$50,000.00')).toBeInTheDocument()
  })

  it('should format percentage values', () => {
    render(<StatsCard {...defaultProps} value={85.5} format="percentage" />)
    
    expect(screen.getByText('85.5%')).toBeInTheDocument()
  })

  it('should show live badge when realTime is true', () => {
    render(<StatsCard {...defaultProps} realTime={true} />)
    
    expect(screen.getByTestId('badge')).toBeInTheDocument()
    expect(screen.getByText('Live')).toBeInTheDocument()
    expect(screen.getByTestId('wifi')).toBeInTheDocument()
  })

  it('should show trend indicators', () => {
    render(<StatsCard {...defaultProps} change={12.5} trend="up" />)
    
    expect(screen.getByTestId('trending-up')).toBeInTheDocument()
    expect(screen.getByText('12.5%')).toBeInTheDocument()
    expect(screen.getByText('vs last period')).toBeInTheDocument()
  })
})