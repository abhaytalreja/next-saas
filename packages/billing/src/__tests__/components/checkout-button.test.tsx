import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CheckoutButton } from '../../components/checkout-button'

// Mock the checkout hook
jest.mock('../../hooks/use-checkout', () => ({
  useCheckout: jest.fn()
}))

import { useCheckout } from '../../hooks/use-checkout'

const mockUseCheckout = useCheckout as jest.MockedFunction<typeof useCheckout>

describe('CheckoutButton', () => {
  const defaultProps = {
    priceId: 'price_test123',
    organizationId: 'org_test123'
  }

  beforeEach(() => {
    mockUseCheckout.mockReturnValue({
      createCheckoutSession: jest.fn(),
      isLoading: false,
      error: null
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders checkout button with default text', () => {
    render(<CheckoutButton {...defaultProps} />)

    expect(screen.getByRole('button', { name: 'Subscribe Now' })).toBeInTheDocument()
  })

  it('renders checkout button with custom text', () => {
    render(<CheckoutButton {...defaultProps} buttonText="Get Started" />)

    expect(screen.getByRole('button', { name: 'Get Started' })).toBeInTheDocument()
  })

  it('shows loading state when checkout is in progress', () => {
    mockUseCheckout.mockReturnValue({
      createCheckoutSession: jest.fn(),
      isLoading: true,
      error: null
    })

    render(<CheckoutButton {...defaultProps} />)

    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Processing...')).toBeInTheDocument()
  })

  it('calls createCheckoutSession when clicked', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/session123'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    render(<CheckoutButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
        priceId: 'price_test123',
        organizationId: 'org_test123',
        successUrl: expect.stringContaining('/success'),
        cancelUrl: expect.stringContaining('/cancel')
      })
    })
  })

  it('handles checkout session creation with custom URLs', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/session456'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    const customProps = {
      ...defaultProps,
      successUrl: 'https://example.com/custom-success',
      cancelUrl: 'https://example.com/custom-cancel'
    }

    render(<CheckoutButton {...customProps} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith({
        priceId: 'price_test123',
        organizationId: 'org_test123',
        successUrl: 'https://example.com/custom-success',
        cancelUrl: 'https://example.com/custom-cancel'
      })
    })
  })

  it('redirects to checkout URL on successful session creation', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/session789'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    // Mock window.location.href
    delete (global as any).window.location
    global.window.location = { href: '' } as any

    render(<CheckoutButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(global.window.location.href).toBe('https://checkout.stripe.com/session789')
    })
  })

  it('shows error message when checkout fails', async () => {
    const mockError = new Error('Payment method declined')
    mockUseCheckout.mockReturnValue({
      createCheckoutSession: jest.fn(),
      isLoading: false,
      error: mockError
    })

    render(<CheckoutButton {...defaultProps} />)

    expect(screen.getByText('Payment method declined')).toBeInTheDocument()
    expect(screen.getByRole('button')).not.toBeDisabled()
  })

  it('handles trial period days in checkout session', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/trial123'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    render(<CheckoutButton {...defaultProps} trialPeriodDays={14} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          trialPeriodDays: 14
        })
      )
    })
  })

  it('includes metadata in checkout session', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/metadata123'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    const metadata = {
      plan_type: 'professional',
      source: 'pricing_page'
    }

    render(<CheckoutButton {...defaultProps} metadata={metadata} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata
        })
      )
    })
  })

  it('handles promotional codes when enabled', async () => {
    const mockCreateCheckoutSession = jest.fn().mockResolvedValue({
      url: 'https://checkout.stripe.com/promo123'
    })

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    render(<CheckoutButton {...defaultProps} allowPromotionCodes={true} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledWith(
        expect.objectContaining({
          allowPromotionCodes: true
        })
      )
    })
  })

  it('supports custom CSS classes', () => {
    render(<CheckoutButton {...defaultProps} className="custom-button-class" />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    expect(button).toHaveClass('custom-button-class')
  })

  it('can be disabled', () => {
    render(<CheckoutButton {...defaultProps} disabled={true} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    expect(button).toBeDisabled()
  })

  it('prevents multiple clicks during loading', async () => {
    const mockCreateCheckoutSession = jest.fn()
      .mockImplementationOnce(() => new Promise(resolve => setTimeout(resolve, 100)))

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: null
    })

    const { rerender } = render(<CheckoutButton {...defaultProps} />)

    const button = screen.getByRole('button', { name: 'Subscribe Now' })
    
    // First click
    fireEvent.click(button)

    // Update to show loading state
    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: true,
      error: null
    })

    rerender(<CheckoutButton {...defaultProps} />)

    // Second click while loading
    fireEvent.click(button)

    await waitFor(() => {
      expect(mockCreateCheckoutSession).toHaveBeenCalledTimes(1)
    })
  })

  it('handles network errors gracefully', async () => {
    const mockCreateCheckoutSession = jest.fn().mockRejectedValue(
      new Error('Network error')
    )

    mockUseCheckout.mockReturnValue({
      createCheckoutSession: mockCreateCheckoutSession,
      isLoading: false,
      error: new Error('Network error')
    })

    render(<CheckoutButton {...defaultProps} />)

    expect(screen.getByText('Network error')).toBeInTheDocument()
  })
})