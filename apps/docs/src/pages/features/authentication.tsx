export default function AuthenticationPage() {
  return (
    <div className="prose max-w-none">
      <h1>🔐 Authentication</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">✅ Already Set Up!</p>
        <p className="text-green-800">
          Authentication is fully configured and ready to use. This guide shows you how to work with the existing auth system.
        </p>
      </div>

      <h2>Overview</h2>
      
      <p>
        NextSaaS comes with a complete authentication system powered by Supabase Auth. 
        Everything is pre-configured, including:
      </p>

      <ul>
        <li>Email/password authentication</li>
        <li>Social login providers (Google, GitHub)</li>
        <li>Magic link authentication</li>
        <li>Password reset flows</li>
        <li>Email verification</li>
        <li>Protected routes and middleware</li>
      </ul>

      <h2>🚀 Using Authentication</h2>

      <h3>Get Current User</h3>
      
      <p>Use the <code>useAuth</code> hook anywhere in your app:</p>

      <pre><code>{`import { useAuth } from '@nextsaas/auth';

export function MyComponent() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.email}!</div>;
}`}</code></pre>

      <h3>Sign In/Sign Up Forms</h3>
      
      <p>Pre-built auth forms are available in the web app:</p>

      <ul>
        <li><code>/sign-in</code> - Sign in page</li>
        <li><code>/sign-up</code> - Registration page</li>
        <li><code>/reset-password</code> - Password reset</li>
      </ul>

      <p>You can also use the auth components directly:</p>

      <pre><code>{`import { SignInForm, SignUpForm } from '@/components/auth';

// Use in your custom pages
<SignInForm redirectTo="/dashboard" />
<SignUpForm showSocialLogins={true} />`}</code></pre>

      <h3>Protected Routes</h3>
      
      <p>Routes are automatically protected by middleware. To protect additional routes:</p>

      <pre><code>{`// middleware.ts
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/protected/:path*',
    // Add your protected routes here
  ]
}`}</code></pre>

      <h3>Sign Out</h3>

      <pre><code>{`import { useAuth } from '@nextsaas/auth';

export function SignOutButton() {
  const { signOut } = useAuth();
  
  return (
    <button onClick={() => signOut()}>
      Sign Out
    </button>
  );
}`}</code></pre>

      <h2>🎨 Customization</h2>

      <h3>Adding Social Providers</h3>
      
      <p>
        Social providers are configured in your Supabase dashboard. 
        To enable a provider:
      </p>

      <ol>
        <li>Go to your <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer">Supabase dashboard</a></li>
        <li>Navigate to Authentication → Providers</li>
        <li>Enable desired providers (Google, GitHub, etc.)</li>
        <li>Add the provider credentials</li>
      </ol>

      <p>Then use in your app:</p>

      <pre><code>{`import { supabase } from '@nextsaas/supabase';

// Sign in with Google
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: window.location.origin + '/dashboard'
  }
});

// Sign in with GitHub
const { error } = await supabase.auth.signInWithOAuth({
  provider: 'github'
});`}</code></pre>

      <h3>Custom Email Templates</h3>
      
      <p>
        Email templates can be customized in your Supabase dashboard under 
        Authentication → Email Templates. The following templates are available:
      </p>

      <ul>
        <li>Confirm signup</li>
        <li>Reset password</li>
        <li>Magic link</li>
        <li>Change email address</li>
      </ul>

      <h3>User Profiles</h3>
      
      <p>User profiles are automatically created in the <code>profiles</code> table:</p>

      <pre><code>{`// Get user profile
import { supabase } from '@nextsaas/supabase';

const { data: profile } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', user.id)
  .single();

// Update profile
const { error } = await supabase
  .from('profiles')
  .update({ 
    full_name: 'John Doe',
    avatar_url: 'https://...'
  })
  .eq('id', user.id);`}</code></pre>

      <h2>🛡️ Security Features</h2>

      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Row Level Security (RLS)</h4>
          <p>All database tables have RLS policies ensuring users can only access their own data.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Session Management</h4>
          <p>Sessions are automatically refreshed and validated. Expired sessions redirect to sign-in.</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold mb-2">CSRF Protection</h4>
          <p>Built-in CSRF protection for all authenticated requests.</p>
        </div>
      </div>

      <h2>🔧 Advanced Usage</h2>

      <h3>Custom Authentication Flows</h3>

      <pre><code>{`import { supabase } from '@nextsaas/supabase';

// Sign up with additional metadata
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    data: {
      full_name: 'John Doe',
      company: 'Acme Corp'
    }
  }
});

// Sign in with redirect
const { error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password',
  options: {
    redirectTo: '/dashboard/onboarding'
  }
});`}</code></pre>

      <h3>Auth State Changes</h3>

      <pre><code>{`import { useEffect } from 'react';
import { supabase } from '@nextsaas/supabase';

useEffect(() => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => {
      if (event === 'SIGNED_IN') {
        console.log('User signed in:', session);
      }
      if (event === 'SIGNED_OUT') {
        console.log('User signed out');
      }
    }
  );

  return () => subscription.unsubscribe();
}, []);`}</code></pre>

      <h3>Server-Side Authentication</h3>

      <pre><code>{`import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function ServerComponent() {
  const supabase = createServerComponentClient({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/sign-in');
  }
  
  return <div>Welcome {user.email}</div>;
}`}</code></pre>

      <h2>🚨 Common Issues</h2>

      <div className="space-y-4">
        <div>
          <h4 className="font-semibold">User not persisting after sign in</h4>
          <p>Ensure cookies are enabled and the <code>NEXTAUTH_URL</code> matches your domain.</p>
        </div>

        <div>
          <h4 className="font-semibold">Email not sending</h4>
          <p>Check your Supabase email settings and ensure you're not hitting rate limits in development.</p>
        </div>

        <div>
          <h4 className="font-semibold">Social login redirect issues</h4>
          <p>Verify the redirect URL is added to your OAuth provider's allowed URLs.</p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-8">
        <h3 className="text-blue-900 font-semibold mb-2">📚 More Resources</h3>
        <ul className="text-blue-800">
          <li>
            <a href="https://supabase.com/docs/guides/auth" target="_blank" rel="noopener noreferrer" className="underline">
              Supabase Auth Documentation
            </a>
          </li>
          <li>
            <a href="/features/database" className="underline">
              Working with the Database →
            </a>
          </li>
          <li>
            <a href="/guides/adding-features" className="underline">
              Adding New Features →
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}