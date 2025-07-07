import React, { ReactElement } from 'react'
import { render, RenderOptions } from '@testing-library/react'
import { ThemeProvider } from './providers/ThemeProvider'

interface AllTheProvidersProps {
  children: React.ReactNode
}

const AllTheProviders = ({ children }: AllTheProvidersProps) => {
  return (
    <ThemeProvider theme="hubspot" colorMode="light">
      {children}
    </ThemeProvider>
  )
}

const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options })

// Re-export everything
export * from '@testing-library/react'

// Override render method
export { customRender as render }

// Utility to create mock props for components
export const createMockProps = <T extends Record<string, any>>(
  overrides?: Partial<T>
): T => {
  return {
    ...overrides,
  } as T
}

// Utility to test component variants
export const testComponentVariants = <T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  variants: Array<{ name: string; props: T }>
) => {
  describe('Component Variants', () => {
    variants.forEach(({ name, props }) => {
      it(`renders ${name} variant correctly`, () => {
        const { container } = render(<Component {...props} />)
        expect(container.firstChild).toMatchSnapshot()
      })
    })
  })
}

// Utility to test accessibility
export const testAccessibility = async (component: ReactElement) => {
  const { container } = render(component)
  const results = await import('jest-axe').then(mod => mod.axe(container))
  expect(results).toHaveNoViolations()
}