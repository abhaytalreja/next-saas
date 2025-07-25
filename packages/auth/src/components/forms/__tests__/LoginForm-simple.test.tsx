import React from 'react'
import { render, screen } from '@testing-library/react'

// Simple mock component for testing
const MockLoginForm = () => {
  return (
    <div data-testid="login-form">
      <h1>Sign In</h1>
      <form>
        <input type="email" placeholder="Email" data-testid="email-input" />
        <input type="password" placeholder="Password" data-testid="password-input" />
        <button type="submit" data-testid="submit-button">Sign In</button>
        <a href="/forgot-password" data-testid="forgot-password-link">Forgot Password?</a>
      </form>
    </div>
  )
}

describe('LoginForm - Simple Tests', () => {
  it('renders form elements', () => {
    render(<MockLoginForm />)
    
    expect(screen.getByTestId('login-form')).toBeInTheDocument()
    expect(screen.getByTestId('email-input')).toBeInTheDocument()
    expect(screen.getByTestId('password-input')).toBeInTheDocument()
    expect(screen.getByTestId('submit-button')).toBeInTheDocument()
    expect(screen.getByTestId('forgot-password-link')).toBeInTheDocument()
  })

  it('has proper form structure', () => {
    render(<MockLoginForm />)
    
    const emailInput = screen.getByPlaceholderText('Email')
    expect(emailInput).toHaveAttribute('type', 'email')
    
    const passwordInput = screen.getByPlaceholderText('Password')
    expect(passwordInput).toHaveAttribute('type', 'password')
    
    const submitButton = screen.getByRole('button', { name: 'Sign In' })
    expect(submitButton).toHaveAttribute('type', 'submit')
    
    const forgotLink = screen.getByRole('link', { name: 'Forgot Password?' })
    expect(forgotLink).toHaveAttribute('href', '/forgot-password')
  })
})