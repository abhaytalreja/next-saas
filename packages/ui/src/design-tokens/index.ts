/**
 * Design Token System
 * 
 * This module exports all design tokens as JavaScript objects for use in components.
 * The tokens are organized by category and follow the W3C Design Tokens specification.
 */

import colorsTokens from './base/colors.json';
import typographyTokens from './base/typography.json';
import spacingTokens from './base/spacing.json';
import shadowsTokens from './base/shadows.json';

// Export individual token categories
export const colors = colorsTokens.color;
export const typography = typographyTokens.typography;
export const spacing = spacingTokens.spacing;
export const borderRadius = spacingTokens.borderRadius;
export const borderWidth = spacingTokens.borderWidth;
export const shadows = shadowsTokens.shadows;
export const elevation = shadowsTokens.elevation;
export const focus = shadowsTokens.focus;

// Export combined tokens object
export const tokens = {
  colors,
  typography,
  spacing,
  borderRadius,
  borderWidth,
  shadows,
  elevation,
  focus,
};

// Utility functions for accessing token values
export const getTokenValue = (tokenPath: string): string => {
  const paths = tokenPath.split('.');
  let current: any = tokens;
  
  for (const path of paths) {
    if (current[path]) {
      current = current[path];
    } else {
      throw new Error(`Token path "${tokenPath}" not found`);
    }
  }
  
  return current.value || current;
};

// CSS Custom Properties generator
export const generateCSSVariables = () => {
  const cssVars: Record<string, string> = {};
  
  // Helper function to flatten tokens into CSS variables
  const flattenTokens = (obj: any, prefix = '') => {
    Object.entries(obj).forEach(([key, value]: [string, any]) => {
      const cssVar = `--${prefix}${prefix ? '-' : ''}${key}`;
      
      if (value && typeof value === 'object' && value.value) {
        cssVars[cssVar] = value.value;
      } else if (value && typeof value === 'object' && !Array.isArray(value)) {
        flattenTokens(value, `${prefix}${prefix ? '-' : ''}${key}`);
      }
    });
  };
  
  // Generate CSS variables for all token categories
  flattenTokens(colors, 'color');
  flattenTokens(typography.fontSizes, 'font-size');
  flattenTokens(typography.fontWeights, 'font-weight');
  flattenTokens(typography.lineHeights, 'line-height');
  flattenTokens(typography.letterSpacing, 'letter-spacing');
  flattenTokens(spacing, 'spacing');
  flattenTokens(borderRadius, 'border-radius');
  flattenTokens(borderWidth, 'border-width');
  flattenTokens(shadows, 'shadow');
  flattenTokens(elevation, 'elevation');
  flattenTokens(focus, 'focus');
  
  return cssVars;
};

// Type definitions for better TypeScript support
export type ColorScale = keyof typeof colors.primary;
export type ColorPalette = keyof typeof colors;
export type FontSize = keyof typeof typography.fontSizes;
export type FontWeight = keyof typeof typography.fontWeights;
export type LineHeight = keyof typeof typography.lineHeights;
export type LetterSpacing = keyof typeof typography.letterSpacing;
export type SpacingScale = keyof typeof spacing;
export type BorderRadiusScale = keyof typeof borderRadius;
export type BorderWidthScale = keyof typeof borderWidth;
export type ShadowScale = keyof typeof shadows;
export type ElevationLevel = keyof typeof elevation;
export type FocusVariant = keyof typeof focus;

export default tokens;