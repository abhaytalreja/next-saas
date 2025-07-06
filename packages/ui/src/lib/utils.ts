import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import * as brandTokens from '@nextsaas/config/design-tokens/brand-tokens.json'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const tokens = brandTokens.tokens

export const getColor = (path: string): string => {
  const keys = path.split('.')
  let value: any = tokens.colors

  for (const key of keys) {
    value = value?.[key]
  }

  return value || '#000000'
}

export const getSpace = (size: keyof typeof tokens.spacing): string => {
  return tokens.spacing[size] || '0'
}

export const getFontSize = (
  size: keyof typeof tokens.typography.fontSizes
): string => {
  return tokens.typography.fontSizes[size] || '1rem'
}

export const getShadow = (size: keyof typeof tokens.shadows): string => {
  return tokens.shadows[size] || 'none'
}

export const getRadius = (size: keyof typeof tokens.borderRadius): string => {
  return tokens.borderRadius[size] || '0'
}
