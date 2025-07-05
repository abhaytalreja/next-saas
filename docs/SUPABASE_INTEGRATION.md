# NextSaaS Supabase Integration Guide

This guide provides comprehensive information about the Supabase integration in NextSaaS, including setup, usage, and best practices.

## 🎯 Overview

The NextSaaS Supabase integration provides:

- **Multi-environment client setup** - Browser, server, and admin clients
- **Complete authentication system** - Multiple providers with React hooks
- **Type-safe database operations** - Generated types and validation
- **Real-time subscriptions** - Live data updates and presence tracking
- **Flexible file storage** - Support for Backblaze B2, AWS S3, and Supabase Storage
- **Row Level Security** - Built-in multi-tenant data isolation
- **Error handling** - Comprehensive error management
- **CLI tools** - Development utilities for migrations and types

## 🚀 Quick Setup

### 1. Environment Configuration

Create your `.env.local` file with the required variables:

```env
# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# Storage Provider
STORAGE_PROVIDER=backblaze

# Backblaze B2 Configuration
BACKBLAZE_KEY_ID=your-key-id
BACKBLAZE_APPLICATION_KEY=your-app-key
BACKBLAZE_BUCKET_ID=your-bucket-id
BACKBLAZE_BUCKET_NAME=your-bucket-name
```

### 2. Install Dependencies

```bash
cd packages/supabase
npm install
```

### 3. Generate Types

```bash
npm run generate:types
```

### 4. Run Migrations

```bash
npm run migrate:up
```

## 🔧 Client Configuration

### Browser Client

Used for client-side operations with RLS enabled:

```typescript
import { getSupabaseBrowserClient } from '@nextsaas/supabase';

const supabase = getSupabaseBrowserClient();

// Automatically handles:
// - Session management
// - Cookie storage
// - Auth state changes
// - RLS enforcement
```

### Server Client

Used for server-side operations in App Router:

```typescript
import { createSupabaseServerClient } from '@nextsaas/supabase';

const supabase = createSupabaseServerClient();

// Automatically handles:
// - Cookie-based sessions
// - Server Components
// - API Routes
// - Server Actions
```

### Admin Client

Used for privileged operations that bypass RLS:

```typescript
import { getSupabaseAdminClient } from '@nextsaas/supabase';

const supabase = getSupabaseAdminClient();

// WARNING: Bypasses all RLS policies
// Only use on the server for admin operations
```

## 🔐 Authentication

### Email/Password Authentication

```typescript
import { useAuth } from '@nextsaas/supabase';

function AuthComponent() {
  const { signIn, signUp, user, loading, error } = useAuth();

  const handleSignIn = async (email: string, password: string) => {
    const { data, error } = await signIn({ email, password });
    if (error) {
      console.error('Sign in failed:', error.message);
    }
  };

  const handleSignUp = async (email: string, password: string, name: string) => {
    const { data, error } = await signUp({
      email,
      password,
      name,
      organizationName: 'My Company', // Optional
    });
  };

  return (
    <div>
      {loading && <div>Loading...</div>}
      {error && <div>Error: {error.message}</div>}
      {user ? (
        <div>Welcome, {user.email}!</div>
      ) : (
        <AuthForm onSignIn={handleSignIn} onSignUp={handleSignUp} />
      )}
    </div>
  );
}
```

### OAuth Authentication

```typescript
import { signInWithOAuth, getEnabledOAuthProviders } from '@nextsaas/supabase';

function OAuthButtons() {
  const enabledProviders = getEnabledOAuthProviders();

  const handleOAuth = async (provider: string) => {
    await signInWithOAuth({
      provider,
      redirectTo: '/dashboard',
    });
  };

  return (
    <div>
      {enabledProviders.map(provider => (
        <button
          key={provider}
          onClick={() => handleOAuth(provider)}
        >
          Sign in with {provider}
        </button>
      ))}
    </div>
  );
}
```

### Magic Link Authentication

```typescript
import { signInWithMagicLink } from '@nextsaas/supabase';

const handleMagicLink = async (email: string) => {
  const { error } = await signInWithMagicLink({
    email,
    redirectTo: '/dashboard',
  });
  
  if (!error) {
    alert('Check your email for the magic link!');
  }
};
```

## 💾 Database Operations

### User Operations

```typescript
import {
  getUserById,
  getUserByEmail,
  updateUserProfile,
  searchUsers,
} from '@nextsaas/supabase';

// Get user by ID
const { data: user, error } = await getUserById(supabase, userId);

// Search users
const { data: users } = await searchUsers(supabase, 'john', {
  limit: 10,
  orderBy: [{ column: 'created_at', ascending: false }],
  filters: [{ column: 'email_verified_at', operator: 'is', value: null }],
});

// Update profile
const { data: updated } = await updateUserProfile(supabase, userId, {
  name: 'John Doe',
  avatar_url: 'https://example.com/avatar.jpg',
  timezone: 'America/New_York',
});
```

### Organization Operations

```typescript
import {
  createOrganizationWithOwner,
  getUserOrganizations,
  addOrganizationMember,
  getOrganizationStats,
} from '@nextsaas/supabase';

// Create organization with owner
const { data: org } = await createOrganizationWithOwner(
  supabase,
  {
    name: 'My Company',
    slug: 'my-company',
    domain: 'mycompany.com',
  },
  userId
);

// Get user's organizations
const { data: orgs } = await getUserOrganizations(supabase, userId);

// Add member
await addOrganizationMember(supabase, orgId, userId, 'member', invitedBy);

// Get stats
const { data: stats } = await getOrganizationStats(supabase, orgId);
console.log(`Members: ${stats.memberCount}, Projects: ${stats.projectCount}`);
```

### Custom Queries

```typescript
import { buildQuery } from '@nextsaas/supabase';

// Build complex queries
const options = {
  select: 'id, name, created_at, organization:organizations(name)',
  filters: [
    { column: 'is_archived', operator: 'eq', value: false },
    { column: 'created_at', operator: 'gte', value: '2024-01-01' },
  ],
  orderBy: [{ column: 'created_at', ascending: false }],
  limit: 20,
};

let query = supabase.from('projects').select(options.select);
query = buildQuery(query, options);
const { data, error } = await query;
```

## ⚡ Real-time Features

### Table Subscriptions

```typescript
import { useRealtimeSubscription } from '@nextsaas/supabase';

function ProjectList() {
  const [projects, setProjects] = useState([]);

  // Subscribe to project changes
  useRealtimeSubscription(
    'projects',
    (payload) => {
      console.log('Change received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setProjects(prev => [...prev, payload.new]);
      } else if (payload.eventType === 'UPDATE') {
        setProjects(prev => 
          prev.map(p => p.id === payload.new.id ? payload.new : p)
        );
      } else if (payload.eventType === 'DELETE') {
        setProjects(prev => 
          prev.filter(p => p.id !== payload.old.id)
        );
      }
    },
    {
      event: '*', // or 'INSERT', 'UPDATE', 'DELETE'
      filter: 'organization_id=eq.123',
    }
  );

  return (
    <div>
      {projects.map(project => (
        <div key={project.id}>{project.name}</div>
      ))}
    </div>
  );
}
```

### Presence Tracking

```typescript
import { usePresence } from '@nextsaas/supabase';

function CollaborativeEditor() {
  const { onlineUsers, updatePresence } = usePresence({
    channelName: `project-${projectId}`,
    userInfo: {
      id: user.id,
      email: user.email,
      name: user.name,
      color: generateUserColor(user.id),
    },
  });

  // Update presence when cursor moves
  const handleMouseMove = (e: MouseEvent) => {
    updatePresence({
      cursor: { x: e.clientX, y: e.clientY },
      lastActivity: new Date(),
    });
  };

  return (
    <div onMouseMove={handleMouseMove}>
      <div className="presence-bar">
        <span>Online ({onlineUsers.length})</span>
        {onlineUsers.map(user => (
          <div
            key={user.id}
            className="user-avatar"
            style={{ backgroundColor: user.color }}
          >
            {user.name?.charAt(0)}
          </div>
        ))}
      </div>
      
      <textarea />
    </div>
  );
}
```

### Cursor Tracking

```typescript
import { useCursorPresence } from '@nextsaas/supabase';

function CollaborativeCanvas() {
  const { cursors, updateCursor } = useCursorPresence(
    `canvas-${canvasId}`,
    user.id
  );

  const handleMouseMove = (e: MouseEvent) => {
    updateCursor(e.clientX, e.clientY);
  };

  return (
    <div onMouseMove={handleMouseMove}>
      {/* Render other users' cursors */}
      {Array.from(cursors.entries()).map(([userId, cursor]) => (
        <div
          key={userId}
          className="cursor"
          style={{ left: cursor.x, top: cursor.y }}
        />
      ))}
    </div>
  );
}
```

## 📁 File Storage

### Storage Configuration

The system supports multiple storage providers:

```typescript
import { StorageClient, getStorageConfig } from '@nextsaas/supabase';

// Initialize with auto-config from environment
const storage = new StorageClient(getStorageConfig());

// Or configure manually
const storage = new StorageClient({
  provider: 'backblaze',
  backblaze: {
    applicationKeyId: process.env.BACKBLAZE_KEY_ID!,
    applicationKey: process.env.BACKBLAZE_APPLICATION_KEY!,
    bucketId: process.env.BACKBLAZE_BUCKET_ID!,
    bucketName: process.env.BACKBLAZE_BUCKET_NAME!,
  },
});
```

### File Upload

```typescript
const uploadFile = async (file: File) => {
  const { data, error } = await storage.upload(
    {
      bucket: 'avatars',
      path: `user-${userId}/${file.name}`,
      file,
      contentType: file.type,
      metadata: {
        userId,
        originalName: file.name,
        uploadedAt: new Date().toISOString(),
      },
    },
    (progress) => {
      console.log(`Upload progress: ${progress.percentage}%`);
      setUploadProgress(progress.percentage);
    }
  );

  if (error) {
    console.error('Upload failed:', error.message);
    return;
  }

  console.log('File uploaded:', data.publicUrl);
};
```

### File Management

```typescript
// List files
const { data: files } = await storage.list({
  bucket: 'documents',
  path: 'user-123/',
  limit: 50,
  sortBy: { column: 'created_at', order: 'desc' },
});

// Create signed URL for temporary access
const { data: signedUrl } = await storage.createSignedUrl(
  'documents',
  'user-123/report.pdf',
  {
    expiresIn: 3600, // 1 hour
    download: 'Monthly Report.pdf',
  }
);

// Delete file
await storage.delete('documents', 'user-123/old-file.pdf');

// Check if file exists
const exists = await storage.exists('avatars', `user-${userId}/avatar.jpg`);
```

## 🔒 Security Best Practices

### Row Level Security (RLS)

All database operations automatically respect RLS policies:

```sql
-- Example RLS policy
CREATE POLICY "Users can only view their own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Organization members can view projects" ON projects
  FOR SELECT USING (
    auth.check_org_membership(organization_id, auth.uid())
  );
```

### Environment Security

```typescript
// ✅ Good: Using environment variables
const config = getSupabaseConfig();

// ❌ Bad: Hardcoding keys
const supabase = createClient('https://...', 'hardcoded-key');

// ✅ Good: Server-side admin operations
const adminSupabase = getSupabaseAdminClient(); // Server only

// ❌ Bad: Exposing admin client to browser
const adminSupabase = getSupabaseAdminClient(); // In browser code
```

### Input Validation

```typescript
import { signUpSchema } from '@nextsaas/supabase';

const handleSignUp = async (formData: any) => {
  try {
    // Validate input
    const validatedData = signUpSchema.parse(formData);
    
    // Proceed with sign up
    await signUp(validatedData);
  } catch (error) {
    // Handle validation errors
    console.error('Invalid input:', error.errors);
  }
};
```

## 🛠️ Development Tools

### Type Generation

Generate TypeScript types from your Supabase schema:

```bash
# Generate types
npm run generate:types

# Or use CLI directly
npx nextsaas-supabase types
```

### Migrations

```bash
# Run migrations
npm run migrate:up

# Create new migration
npm run migrate:create add_user_preferences

# Rollback last migration
npm run migrate:down
```

### Seeding

```bash
# Run seeds
npm run seed:run

# Reset database and seed
npm run seed:reset
```

## 🚨 Error Handling

### Custom Error Types

```typescript
import { SupabaseError, withErrorHandling } from '@nextsaas/supabase';

try {
  const user = await withErrorHandling(
    () => getUserById(supabase, userId),
    'Failed to fetch user profile'
  );
} catch (error) {
  if (error instanceof SupabaseError) {
    // Handle specific error types
    switch (error.code) {
      case '23505': // Unique violation
        setError('This email is already taken');
        break;
      case 'PGRST301': // JWT expired
        redirectToLogin();
        break;
      default:
        setError(error.message);
    }
  }
}
```

### React Error Boundaries

```typescript
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div>
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
      <button onClick={resetErrorBoundary}>Try again</button>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <YourApp />
    </ErrorBoundary>
  );
}
```

## 🔧 Advanced Configuration

### Custom Middleware

```typescript
// middleware.ts
import { updateSession, isProtectedPath } from '@nextsaas/supabase';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);
  
  // Check if route requires authentication
  if (isProtectedPath(request.nextUrl.pathname) && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  
  return response;
}
```

### Performance Optimization

```typescript
// Connection pooling for high-traffic scenarios
const config = getSupabaseConfig();
config.options = {
  ...config.options,
  db: {
    schema: 'public',
    // Add connection pooling options
  },
  global: {
    headers: {
      'x-connection-pool': 'enabled',
    },
  },
};
```

### Monitoring and Analytics

```typescript
import { useEffect } from 'react';

function useSupabaseAnalytics() {
  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    
    // Track auth events
    supabase.auth.onAuthStateChange((event, session) => {
      analytics.track('auth_state_changed', {
        event,
        userId: session?.user?.id,
      });
    });
  }, []);
}
```

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [NextSaaS Database Schema](./DATABASE_SETUP.md)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Backblaze B2 API](https://www.backblaze.com/b2/docs/)
- [AWS S3 API](https://docs.aws.amazon.com/s3/)

## 🤝 Contributing

When contributing to the Supabase integration:

1. Add tests for new features
2. Update TypeScript types
3. Follow the existing error handling patterns
4. Add JSDoc comments for public APIs
5. Update this documentation

## 🐛 Troubleshooting

### Common Issues

1. **"Invalid JWT" errors**: Check if session has expired, refresh token automatically
2. **RLS policy violations**: Ensure user has proper permissions for the operation
3. **Storage upload failures**: Verify bucket permissions and file size limits
4. **Type errors**: Regenerate types after schema changes

### Debug Mode

Enable debug logging:

```typescript
const supabase = createSupabaseClient(url, key, {
  global: {
    headers: {
      'x-debug': 'true',
    },
  },
});
```