# Authentication Pattern for NextSaaS

## Critical Fix Pattern ⚠️
**Always ensure unified Supabase client usage across the entire application**

### Problem Solved
- AuthProvider was using `@supabase/supabase-js` (localStorage-based)
- Rest of app was using `@supabase/ssr` (cookie-based SSR-optimized)
- This caused session state conflicts leading to 401 authentication errors

### Solution Pattern
1. **Standardize on SSR Client**: All components MUST import from `@nextsaas/supabase`
   ```typescript
   // ✅ Correct - Use this everywhere
   import { getSupabaseBrowserClient } from '@nextsaas/supabase'
   
   // ❌ Wrong - Never use direct supabase imports
   import { createClient } from '@supabase/supabase-js'
   ```

2. **Path Alias Configuration**: Ensure tsconfig.json has correct path mapping
   ```json
   "paths": {
     "@/*": ["./src/*"]  // ✅ Points to src directory
   }
   ```

3. **Route Configuration**: Use consistent route names
   ```typescript
   // ✅ Correct routes in AuthProvider and middleware
   redirectTo = '/auth/sign-in'  // Not '/auth/login'
   ```

### Build Requirements
- Always add `@nextsaas/supabase` as external dependency in package build configs
- Build supabase package before auth package
- Rebuild auth package after any route or client changes

### For Future Development
- Never create separate Supabase client instances
- Always use the unified client from `@nextsaas/supabase`
- Test authentication on every major feature to catch session conflicts early

# Testing Strategy and Requirements

## Documentation Updates

- Created comprehensive testing documentation:
  - `./FEATURE_TESTING_REQUIREMENTS.md`
  - `./FEATURE_TESTING_CHECKLIST.md`
  - Updated main `README.md` with testing guidelines

## Testing Approach

### Unit Testing (Mandatory)
- 80% minimum coverage across all metrics
- Comprehensive testing of:
  - Component variants
  - Component states
  - Component interactions
  - Error handling
  - Edge cases
- Implemented accessibility testing

### Integration Testing (Mandatory)
- Validate API integration points
- Test multi-tenant scenarios
- Verify authentication flows
- Confirm component composition

### End-to-End Testing (Mandatory)
- Complete user journey testing
- Cross-browser compatibility
- Visual regression tests
- Performance benchmarks

## Quality Gates and Enforcement

### Blocking Conditions
- Missing unit tests
- Coverage below 80%
- No integration tests for API calls
- No E2E tests for user flows
- Accessibility violations
- Visual regressions
- Breaking existing tests

### Enforcement Mechanisms
- CI/CD Pipeline blocks incomplete tests
- Mandatory code review process
- Staging test requirements before production

## Current Testing Infrastructure
- Jest + React Testing Library
- Playwright for E2E and visual testing
- jest-axe for accessibility
- 92.5% UI component test coverage
- Cross-browser testing configured
- Visual regression testing implemented

## Feature Testing Requirements
- Comprehensive unit tests
- Integration tests for workflows
- End-to-end user journey tests
- Accessibility verification
- Performance assessment
- Cross-browser compatibility