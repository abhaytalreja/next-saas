/**
 * Component Validation Utilities for NextSaaS
 * 
 * This file provides validation schemas and utilities to ensure
 * all components follow the NextSaaS design system standards.
 */

import { z } from 'zod';

// Base props that all components should have
export const BaseComponentPropsSchema = z.object({
  className: z.string().optional(),
  'data-testid': z.string().optional(),
  id: z.string().optional(),
  
  // Accessibility requirements
  'aria-label': z.string().optional(),
  'aria-describedby': z.string().optional(),
  'aria-labelledby': z.string().optional(),
  role: z.string().optional(),
});

// Button component validation
export const ButtonPropsSchema = BaseComponentPropsSchema.extend({
  variant: z.enum(['primary', 'secondary', 'outline', 'ghost', 'destructive']),
  size: z.enum(['sm', 'md', 'lg', 'xl']),
  disabled: z.boolean().optional(),
  loading: z.boolean().optional(),
  type: z.enum(['button', 'submit', 'reset']).optional(),
  children: z.any(),
  onClick: z.function().optional(),
});

// Input component validation
export const InputPropsSchema = BaseComponentPropsSchema.extend({
  type: z.enum(['text', 'email', 'password', 'number', 'tel', 'url', 'search']).optional(),
  variant: z.enum(['default', 'filled', 'error']).optional(),
  size: z.enum(['sm', 'md', 'lg']).optional(),
  placeholder: z.string().optional(),
  value: z.string().optional(),
  defaultValue: z.string().optional(),
  disabled: z.boolean().optional(),
  required: z.boolean().optional(),
  onChange: z.function().optional(),
});

// Card component validation
export const CardPropsSchema = BaseComponentPropsSchema.extend({
  variant: z.enum(['default', 'elevated', 'outlined', 'interactive']).optional(),
  padding: z.enum(['none', 'sm', 'md', 'lg']).optional(),
  children: z.any(),
});

// Badge component validation
export const BadgePropsSchema = BaseComponentPropsSchema.extend({
  variant: z.enum(['default', 'primary', 'secondary', 'success', 'warning', 'error', 'outline']).optional(),
  children: z.any(),
});

// Component API validation interface
export interface ComponentAPI {
  name: string;
  props: Record<string, string>;
  variants: string[];
  sizes: string[];
  accessibility: string[];
  examples: string[];
}

// Required props for all components
const REQUIRED_COMPONENT_PROPS = [
  'className',
  'data-testid',
];

// Required accessibility considerations
const REQUIRED_ACCESSIBILITY_PROPS = [
  'aria-label',
  'role',
];

/**
 * Validates that a component follows NextSaaS standards
 */
export function validateComponentAPI(component: ComponentAPI): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required props
  const missingProps = REQUIRED_COMPONENT_PROPS.filter(
    prop => !(prop in component.props)
  );
  
  if (missingProps.length > 0) {
    errors.push(`Component missing required props: ${missingProps.join(', ')}`);
  }

  // Check accessibility props
  const hasAccessibilityProps = REQUIRED_ACCESSIBILITY_PROPS.some(
    prop => prop in component.props
  );
  
  if (!hasAccessibilityProps) {
    errors.push('Component must have at least one accessibility prop (aria-label or role)');
  }

  // Check for examples
  if (!component.examples || component.examples.length === 0) {
    errors.push('Component must have usage examples');
  }

  // Check for variants if component supports them
  const interactiveComponents = ['button', 'input', 'card', 'badge'];
  if (interactiveComponents.includes(component.name.toLowerCase()) && component.variants.length === 0) {
    errors.push('Interactive components must have variants defined');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Runtime prop validation for components
 */
export function validateProps<T>(schema: z.ZodSchema<T>, props: unknown): T {
  try {
    return schema.parse(props);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map(err => 
        `${err.path.join('.')}: ${err.message}`
      ).join(', ');
      
      throw new Error(`Component prop validation failed: ${errorMessages}`);
    }
    throw error;
  }
}

/**
 * Color validation utility
 */
export function validateColorUsage(colorValue: string, designTokens: Record<string, any>): boolean {
  // Extract all color values from design tokens
  const validColors: string[] = [];
  
  function extractColors(obj: any, path: string = '') {
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && value.startsWith('#')) {
        validColors.push(value);
      } else if (typeof value === 'object' && value !== null) {
        extractColors(value, `${path}${key}.`);
      }
    }
  }
  
  extractColors(designTokens);
  
  // Check if the color is in our design system
  if (colorValue.startsWith('#') && !validColors.includes(colorValue)) {
    console.warn(`Invalid color usage: ${colorValue}. Use design system tokens instead.`);
    return false;
  }
  
  return true;
}

/**
 * Accessibility validation utility
 */
export function validateAccessibility(element: HTMLElement): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for proper ARIA labels
  if (element.tagName === 'BUTTON' && !element.getAttribute('aria-label') && !element.textContent?.trim()) {
    issues.push('Button must have aria-label or visible text content');
  }

  // Check for proper form labels
  if (element.tagName === 'INPUT' && element.getAttribute('type') !== 'hidden') {
    const id = element.getAttribute('id');
    const ariaLabelledBy = element.getAttribute('aria-labelledby');
    const ariaLabel = element.getAttribute('aria-label');
    
    if (!ariaLabel && !ariaLabelledBy && (!id || !document.querySelector(`label[for="${id}"]`))) {
      issues.push('Input must have a label, aria-label, or aria-labelledby');
    }
  }

  // Check for minimum touch target size (44px x 44px)
  if (['BUTTON', 'A', 'INPUT'].includes(element.tagName)) {
    const rect = element.getBoundingClientRect();
    if (rect.width < 44 || rect.height < 44) {
      issues.push('Interactive element should have minimum 44px x 44px touch target');
    }
  }

  // Check for sufficient color contrast (simplified check)
  const computedStyle = window.getComputedStyle(element);
  const backgroundColor = computedStyle.backgroundColor;
  const color = computedStyle.color;
  
  if (backgroundColor === 'rgba(0, 0, 0, 0)' && color === 'rgb(0, 0, 0)') {
    // Very basic contrast check - in production, use a proper contrast ratio calculator
    issues.push('Ensure sufficient color contrast ratio (4.5:1 for normal text, 3:1 for large text)');
  }

  return {
    valid: issues.length === 0,
    issues
  };
}

/**
 * Performance validation utility
 */
export function validatePerformance(componentName: string, renderTime: number): boolean {
  const PERFORMANCE_BUDGET = 16; // 60fps budget in milliseconds
  
  if (renderTime > PERFORMANCE_BUDGET) {
    console.warn(`Component ${componentName} render took ${renderTime}ms (over ${PERFORMANCE_BUDGET}ms budget)`);
    return false;
  }
  
  return true;
}

/**
 * Design consistency validation
 */
export function validateDesignConsistency(styles: CSSStyleDeclaration, designTokens: any): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check for hardcoded colors
  const colorProperties = ['color', 'backgroundColor', 'borderColor'];
  colorProperties.forEach(property => {
    const value = styles.getPropertyValue(property);
    if (value && value.startsWith('#')) {
      if (!validateColorUsage(value, designTokens)) {
        issues.push(`Hardcoded color detected in ${property}: ${value}`);
      }
    }
  });

  // Check for hardcoded spacing
  const spacingProperties = ['margin', 'padding', 'gap'];
  spacingProperties.forEach(property => {
    const value = styles.getPropertyValue(property);
    if (value && /^\d+px$/.test(value)) {
      const pxValue = parseInt(value.replace('px', ''));
      if (pxValue > 0 && pxValue < 4) {
        issues.push(`Consider using design system spacing tokens instead of ${value} for ${property}`);
      }
    }
  });

  return {
    valid: issues.length === 0,
    issues
  };
}

// Export all validation schemas for use in components
export const ValidationSchemas = {
  BaseComponentProps: BaseComponentPropsSchema,
  ButtonProps: ButtonPropsSchema,
  InputProps: InputPropsSchema,
  CardProps: CardPropsSchema,
  BadgeProps: BadgePropsSchema,
} as const;