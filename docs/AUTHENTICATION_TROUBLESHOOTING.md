# Authentication Troubleshooting Guide

## Recent Authentication Fixes

This document outlines critical authentication fixes and patterns implemented to resolve session state conflicts and 401 errors.

## Problem Overview

### Root Cause
The application was experiencing 401 authentication errors due to **session state conflicts** between two different Supabase client implementations:

- **AuthProvider**: Using `@supabase/supabase-js` (localStorage-based client)
- **Rest of Application**: Using `@supabase/ssr` (cookie-based SSR-optimized client)

This caused inconsistent session state where:
- Browser showed user as authenticated (`SIGNED_IN`)
- Server-side APIs couldn't access session (`401 Unauthorized`)

## Solution Implementation

### 1. Unified Supabase Client Pattern ⚠️ CRITICAL

**Always use the SSR-optimized client across the entire application:**

```typescript
// ✅ CORRECT - Use everywhere
import { getSupabaseBrowserClient } from '@nextsaas/supabase'

// ❌ WRONG - Never use direct imports
import { createClient } from '@supabase/supabase-js'
```

### 2. AuthProvider Fix

**File**: `packages/auth/src/providers/AuthProvider.tsx`

**Before**:
```typescript
import { getSupabaseBrowserClient } from '../lib/auth-client' // localStorage client
```

**After**:
```typescript
import { getSupabaseBrowserClient } from '@nextsaas/supabase' // SSR client
```

### 3. Route Configuration Fixes

**Fixed redirect loops by standardizing route names:**

- `ProtectedLayout` default redirect: `/auth/login` → `/auth/sign-in`
- Middleware auth routes: Updated to match actual file structure
- Constants: Updated `AUTH_ROUTES` to use correct paths

### 4. Build Configuration

**Added external dependencies to prevent bundling conflicts:**

```typescript
// packages/auth/tsup.config.ts
external: [
  '@nextsaas/supabase', // Critical: Don't bundle, resolve at runtime
  '@supabase/supabase-js',
  // ... other externals
]
```

### 5. TypeScript Path Resolution

**Fixed module resolution for component imports:**

```json
// apps/web/tsconfig.json
"paths": {
  "@/*": ["./src/*"] // Fixed: was "./*"
}
```

## Implementation Checklist

When implementing authentication features, ensure:

- [ ] All components import from `@nextsaas/supabase`
- [ ] No direct `@supabase/supabase-js` imports in client code
- [ ] Build configs include `@nextsaas/supabase` as external
- [ ] Route names match actual file structure
- [ ] TypeScript paths resolve correctly
- [ ] Auth middleware uses consistent route names

## Testing Authentication

### Unit Tests
```bash
npm run test -- packages/auth
```

### Integration Tests
```bash
npm run test:integration -- auth
```

### E2E Tests
```bash
npm run test:e2e -- --grep "authentication"
```

## Common Issues & Solutions

### Issue: 401 Errors on Protected Routes
**Solution**: Check for mixed Supabase client usage

### Issue: Redirect Loops
**Solution**: Verify route names match file structure

### Issue: Session State Mismatch
**Solution**: Ensure unified client usage

### Issue: Build Failures
**Solution**: Check external dependencies in tsup.config.ts

## Database Schema Requirements

For proper authentication, ensure these tables exist:

```sql
-- Users table (managed by Supabase Auth)
-- Organizations table
-- Organization members table with RLS policies
-- Projects table with proper access controls
```

## Best Practices Going Forward

1. **Single Source of Truth**: Always use `@nextsaas/supabase`
2. **Consistent Routes**: Match route names to file structure
3. **Proper Testing**: Test auth on every feature
4. **Build Order**: Build supabase package before auth package
5. **External Dependencies**: Keep Supabase packages external in builds

## Files Modified

- `packages/auth/src/providers/AuthProvider.tsx`
- `packages/auth/src/components/layouts/ProtectedLayout.tsx`
- `packages/auth/src/middleware/auth-middleware.ts`
- `packages/auth/src/utils/constants.ts`
- `packages/auth/tsup.config.ts`
- `apps/web/tsconfig.json`
- `apps/web/src/app/auth/*/page.tsx` (all auth pages)
- `apps/web/src/components/projects/ProjectActivity.tsx`

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Development patterns
- [Authentication Guide](./AUTHENTICATION_GUIDE.md) - Setup guide
- [Multi-tenant Guide](./MULTI_TENANT_GUIDE.md) - Organization patterns