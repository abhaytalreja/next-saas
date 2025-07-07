# UI Component Test Badge System

## Overview

The UI package now includes an automated test badge system that displays test status for each component, making it easy to verify component quality at a glance.

## Features

### 1. Component-Level Badges
Each component has individual badges showing:
- **Test Coverage**: Percentage of tests passing
- **Accessibility**: WCAG 2.1 AA compliance status
- **Responsive**: Mobile/tablet testing status  
- **Performance**: Render performance status
- **Visual**: Visual regression test status

### 2. Auto-Generated Reports

#### TEST_STATUS.md
- Overview table of all components
- Individual test status badges
- Detailed test statistics
- Auto-updated on test runs

#### Component READMEs
- Each component folder has README.md with test badges
- Shows test results specific to that component
- Coverage percentage and test counts

#### COMPONENT_GALLERY.md
- Visual gallery of all components
- Links to documentation
- Test status at a glance
- Coverage percentages

### 3. Main Repository Badges
The main README.md shows overall UI package status:
- Total test coverage percentage
- Number of passing tests
- Accessibility compliance
- Component count
- Build status

### 4. React Component
`TestStatusBadge` component for displaying test status inline:

```tsx
import { TestStatusBadge } from '@nextsaas/ui'

// Simple badge
<TestStatusBadge component="Button" />

// Detailed view with coverage bar
<TestStatusBadge component="Button" showDetails />
```

### 5. CI/CD Integration
- GitHub Actions workflow updates badges automatically
- PR comments show test results
- Artifacts uploaded for each test run
- Badges update on main branch pushes

## Usage

### Running Tests and Generating Badges

```bash
# Run tests and generate all reports/badges
npm run test:update-badges

# Generate just the test report
npm run test:report

# Generate badges from existing test results
npm run test:badge
```

### Badge Locations

1. **Component Folders**: `src/[category]/[component]/README.md`
2. **UI Package Overview**: `packages/ui/TEST_STATUS.md`
3. **Component Gallery**: `packages/ui/COMPONENT_GALLERY.md`
4. **Main Repository**: `README.md` (UI Package Status section)
5. **Test Results JSON**: `packages/ui/test-status.json`

### Adding Test Status to Documentation

In your documentation pages, you can import and use the test status:

```tsx
import { TestStatusBadge, useTestStatus } from '@nextsaas/ui'

export default function ButtonDocs() {
  const testStatus = useTestStatus('Button')
  
  return (
    <div>
      <h1>Button Component</h1>
      <TestStatusBadge component="Button" showDetails />
      
      {testStatus && (
        <p>This component has {testStatus.coverage}% test coverage</p>
      )}
    </div>
  )
}
```

## Badge Types

### Test Coverage
- 🟢 Green (90%+): Excellent coverage
- 🟡 Yellow (70-89%): Good coverage
- 🔴 Red (<70%): Needs improvement

### Accessibility
- 🟢 Passing: All accessibility tests pass
- 🟡 Pending: Not yet tested

### Visual Tests
- 🟢 Tested: Visual regression tests exist
- 🟡 Pending: No visual tests

### Performance
- 🟢 Optimized: Meets performance targets
- 🟡 Untested: No performance benchmarks

## Customization

### Adding New Test Types

Edit `scripts/generate-test-report.js` to detect new test types:

```js
if (test.title.toLowerCase().includes('your-test-type')) {
  components[componentName].yourTestType = true
}
```

### Changing Badge Colors

Update the color codes in `generate-test-report.js`:

```js
const colors = {
  passing: '#4c1',    // Green
  failing: '#e05d44', // Red
  skipped: '#dfb317', // Yellow
  unknown: '#9f9f9f'  // Gray
}
```

### Custom Badge URLs

Badges use shields.io format. You can customize the URL pattern:

```js
function generateBadge(label, message, color) {
  return `https://img.shields.io/badge/${label}-${message}-${color}`
}
```

## Best Practices

1. **Run badge updates before commits** to keep status current
2. **Include test type keywords** in test names for automatic detection
3. **Review badge changes** in PRs to catch test regressions
4. **Use TestStatusBadge component** in documentation for live status
5. **Monitor coverage trends** using the JSON output

## Troubleshooting

### Badges not updating
1. Ensure tests run successfully first
2. Check that `test-results.json` is generated
3. Verify file paths in scripts are correct

### Missing components
Components must have test files matching pattern:
`src/(atoms|molecules|organisms|templates)/[folder]/[name].test.tsx`

### Incorrect coverage
- Check for skipped tests counting against coverage
- Ensure all test results are captured in JSON output
- Verify test counting logic in generate-test-report.js