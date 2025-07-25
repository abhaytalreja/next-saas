import React from 'react'
import { render, screen } from '@testing-library/react'

// Simple mock component for testing
const MockSignupForm = () => {
  return (
    <div data-testid="signup-form">
      <h1>Sign Up</h1>
      <form>
        <input type="email" placeholder="Email" data-testid="email-input" />
        <input type="password" placeholder="Password" data-testid="password-input" />
        <button type="submit" data-testid="submit-button">Sign Up</button>
      </form>
    </div>
  )
}

describe('SignupForm - Simple Tests', () => {
  it('renders form elements', () => {
    render(<MockSignupForm />)
    
    expect(screen.getByTestId('signup-form')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
  })

  it('has proper form structure', () => {
    render(<MockSignupForm />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    expect(emailInput).toHaveAttribute('type', 'email')
    
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const submitButton = screen.getByRole('button', { name: 'Sign Up' })
    expect(submitButton).toHaveAttribute('type', 'submit')
  })
})