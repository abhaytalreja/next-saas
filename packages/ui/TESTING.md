# UI Package Testing Guide

## Overview

The UI package includes comprehensive testing infrastructure for ensuring component quality, performance, and accessibility.

## Test Types

### 1. Unit Tests (Jest + React Testing Library)
- **Location**: `src/**/*.test.tsx`
- **Coverage**: 74 tests across core components
- **Run**: `npm test`

### 2. Visual Regression Tests (Playwright)
- **Location**: `src/**/*.visual.test.ts`
- **Coverage**: Cross-browser visual testing
- **Run**: `npm run test:visual`

### 3. Accessibility Tests (jest-axe)
- **Integrated**: Within unit tests
- **Standard**: WCAG 2.1 AA compliance
- **Coverage**: All interactive components

### 4. Performance Tests
- **Bundle Size**: Automated size checking
- **SSR Performance**: Render time benchmarks
- **Run**: `npm run benchmark`

## Running Tests

```bash
# Unit tests
npm test                    # Run all tests
npm test:watch             # Watch mode
npm test:coverage          # Coverage report
npm test:ci               # CI mode

# Visual tests
npm run test:visual        # Run visual tests
npm run test:visual:update # Update snapshots
npm run test:visual:ui     # Interactive UI

# Performance
npm run analyze           # Bundle analysis
npm run benchmark         # Performance tests
npm run size             # Bundle size check
```

## Test Results

### Unit Test Coverage
- **Total Tests**: 80 (74 passing, 6 skipped)
- **Test Suites**: 3 passing
- **Components Tested**: Button, Input, Card
- **Accessibility**: All components pass axe tests

### Bundle Sizes
| Bundle | Size | Gzipped | Status |
|--------|------|---------|---------|
| Main (CJS) | 446.64 KB | 76.07 KB | ✅ |
| Main (ESM) | 406.94 KB | 73.01 KB | ✅ |
| Client (CJS) | 25.21 KB | 5.92 KB | ✅ |
| Client (ESM) | 21.63 KB | 5.24 KB | ✅ |

### Performance Metrics
| Component | Mean Render | P95 | P99 | Status |
|-----------|-------------|-----|-----|---------|
| Button | 62.17μs | 77.38μs | 350.83μs | ✅ |
| Input | 25.39μs | 35.63μs | 144.50μs | ✅ |
| Card | 11.27μs | 12.83μs | 34.71μs | ✅ |

## Writing Tests

### Component Test Template
```tsx
import React from 'react'
import { render, screen } from '../../test-utils'
import { ComponentName } from './ComponentName'
import { testAccessibility } from '../../test-utils'

describe('ComponentName', () => {
  it('renders correctly', () => {
    render(<ComponentName>Content</ComponentName>)
    expect(screen.getByText('Content')).toBeInTheDocument()
  })

  it('has no accessibility violations', async () => {
    await testAccessibility(<ComponentName>Content</ComponentName>)
  })
})
```

### Visual Test Template
```tsx
import { test } from '../../test-utils/visual-test-utils'
import { takeComponentScreenshot, testColorModes } from '../../test-utils/visual-test-utils'

test.describe('ComponentName Visual Tests', () => {
  test('default state', async ({ page }) => {
    await page.goto('/components/component-name')
    await takeComponentScreenshot(page, 'component-name', 'default')
  })

  test('color modes', async ({ page }) => {
    await testColorModes(page, '/components/component-name', 'component-name')
  })
})
```

## CI/CD Integration

Tests run automatically on:
- Pull requests affecting UI package
- Pushes to main branch
- Manual workflow dispatch

GitHub Actions workflow includes:
1. Unit tests with coverage
2. Visual regression tests
3. Bundle size checks
4. Performance benchmarks

## Best Practices

1. **Test Coverage**: Aim for >80% coverage
2. **Accessibility**: Every interactive component must pass axe tests
3. **Performance**: Components should render in <1ms (P95)
4. **Bundle Size**: Keep main bundle under 500KB
5. **Visual Tests**: Update snapshots carefully, review changes

## Troubleshooting

### Common Issues

1. **React Fragment Warning**: Some tests skip `asChild` prop testing due to React.Fragment limitations
2. **Disabled Event Tests**: React 19 may trigger onChange on disabled inputs
3. **Visual Test Failures**: Check for font loading, animations, or timing issues

### Debug Commands

```bash
# Run specific test
npm test -- --testNamePattern="Button"

# Debug visual tests
npm run test:visual:ui

# Check bundle composition
npx source-map-explorer dist/index.js
```