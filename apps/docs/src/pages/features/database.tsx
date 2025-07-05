export default function DatabasePage() {
  return (
    <div className="prose max-w-none">
      <h1>💾 Database</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">✅ Pre-configured Database</p>
        <p className="text-green-800">
          Your Supabase PostgreSQL database is set up with tables, relationships, and Row Level Security policies ready to use.
        </p>
      </div>

      <h2>Overview</h2>
      
      <p>
        NextSaaS includes a production-ready database schema with the following tables:
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">👤 profiles</h4>
          <p className="text-sm text-gray-600">User profiles with extended information</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🏢 organizations</h4>
          <p className="text-sm text-gray-600">Multi-tenant organization support</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">💳 subscriptions</h4>
          <p className="text-sm text-gray-600">Billing and subscription management</p>
        </div>
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">🔐 permissions</h4>
          <p className="text-sm text-gray-600">Role-based access control</p>
        </div>
      </div>

      <h2>🚀 Using the Database</h2>

      <h3>Client-Side Queries</h3>
      
      <pre><code>{`import { supabase } from '@nextsaas/supabase';

// Get current user's profile
const { data: profile, error } = await supabase
  .from('profiles')
  .select('*')
  .single();

// Get user's organizations
const { data: orgs } = await supabase
  .from('organizations')
  .select(\`
    *,
    organization_members!inner(
      role
    )
  \`)
  .eq('organization_members.user_id', user.id);`}</code></pre>

      <h3>Server-Side Queries</h3>

      <pre><code>{`import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export default async function ServerComponent() {
  const supabase = createServerComponentClient({ cookies });
  
  // Queries are automatically scoped to the authenticated user
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .single();
    
  return <div>{profile?.full_name}</div>;
}`}</code></pre>

      <h3>Real-time Subscriptions</h3>

      <pre><code>{`import { useEffect } from 'react';
import { supabase } from '@nextsaas/supabase';

function RealtimeComponent() {
  useEffect(() => {
    const channel = supabase
      .channel('profile-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: \`id=eq.\${user.id}\`
        },
        (payload) => {
          console.log('Profile updated:', payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
}`}</code></pre>

      <h2>📊 Database Schema</h2>

      <h3>Profiles Table</h3>
      
      <p>Extended user information beyond authentication:</p>

      <pre><code>{`interface Profile {
  id: string;              // UUID (matches auth.users.id)
  email: string;           // User's email
  full_name?: string;      // Display name
  avatar_url?: string;     // Profile picture
  bio?: string;           // User bio
  created_at: string;     // Timestamp
  updated_at: string;     // Timestamp
}`}</code></pre>

      <h3>Organizations Table</h3>
      
      <p>Multi-tenant organization support:</p>

      <pre><code>{`interface Organization {
  id: string;              // UUID
  name: string;            // Organization name
  slug: string;            // URL-friendly identifier
  logo_url?: string;       // Organization logo
  created_by: string;      // User ID of creator
  created_at: string;      // Timestamp
  updated_at: string;      // Timestamp
}`}</code></pre>

      <h3>Subscriptions Table</h3>
      
      <p>Billing and subscription management:</p>

      <pre><code>{`interface Subscription {
  id: string;              // UUID
  organization_id: string; // Organization reference
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
  plan_id: string;         // Your plan identifier
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_start: string;
  current_period_end: string;
  created_at: string;
  updated_at: string;
}`}</code></pre>

      <h2>🛡️ Security (RLS Policies)</h2>

      <p>
        All tables have Row Level Security (RLS) enabled with policies that ensure:
      </p>

      <ul>
        <li>Users can only read/write their own data</li>
        <li>Organization data is scoped to members</li>
        <li>Subscription data is restricted to organization admins</li>
      </ul>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-blue-900 font-semibold mb-2">🔒 Important Security Note</p>
        <p className="text-blue-800">
          Never disable RLS policies in production. All database access goes through 
          these policies to ensure data isolation between users and organizations.
        </p>
      </div>

      <h2>🔧 Common Queries</h2>

      <h3>User Onboarding</h3>

      <pre><code>{`// Create organization during onboarding
async function createOrganization(name: string) {
  const { data: org, error } = await supabase
    .from('organizations')
    .insert({
      name,
      slug: name.toLowerCase().replace(/\s+/g, '-'),
      created_by: user.id
    })
    .select()
    .single();
    
  if (!error) {
    // Add user as admin
    await supabase
      .from('organization_members')
      .insert({
        organization_id: org.id,
        user_id: user.id,
        role: 'admin'
      });
  }
  
  return org;
}`}</code></pre>

      <h3>Check Subscription Status</h3>

      <pre><code>{`async function checkSubscription(orgId: string) {
  const { data: subscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .single();
    
  return {
    isActive: !!subscription,
    plan: subscription?.plan_id || 'free',
    endsAt: subscription?.current_period_end
  };
}`}</code></pre>

      <h3>Update Profile</h3>

      <pre><code>{`async function updateProfile(updates: Partial<Profile>) {
  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id);
    
  if (error) {
    console.error('Error updating profile:', error);
  }
}`}</code></pre>

      <h2>🚀 Adding Custom Tables</h2>

      <p>To add new tables for your features:</p>

      <ol>
        <li>Create migration in Supabase dashboard</li>
        <li>Define TypeScript types</li>
        <li>Add RLS policies</li>
        <li>Create queries in your app</li>
      </ol>

      <h3>Example: Adding a Projects Table</h3>

      <pre><code>{`-- SQL Migration
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see projects in their organizations
CREATE POLICY "Users can view organization projects" ON projects
  FOR SELECT USING (
    organization_id IN (
      SELECT organization_id FROM organization_members
      WHERE user_id = auth.uid()
    )
  );`}</code></pre>

      <h2>🔍 Database Tools</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">Supabase Dashboard</h4>
          <p className="text-sm text-gray-600 mb-2">
            Visual database editor, query builder, and real-time logs
          </p>
          <a href="https://app.supabase.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">
            Open Dashboard →
          </a>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">pgAdmin / TablePlus</h4>
          <p className="text-sm text-gray-600 mb-2">
            Connect any PostgreSQL client using your database credentials
          </p>
        </div>
      </div>

      <h2>📈 Performance Tips</h2>

      <ul>
        <li>
          <strong>Use indexes</strong> - Add indexes for frequently queried columns
        </li>
        <li>
          <strong>Batch operations</strong> - Use <code>insert</code> with arrays for bulk inserts
        </li>
        <li>
          <strong>Select specific columns</strong> - Don't use <code>select('*')</code> in production
        </li>
        <li>
          <strong>Use database functions</strong> - Move complex logic to PostgreSQL functions
        </li>
      </ul>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-8">
        <h3 className="text-yellow-900 font-semibold mb-2">⚡ Next Steps</h3>
        <p className="text-yellow-800 mb-3">
          Ready to build your features? Check out these guides:
        </p>
        <ul className="text-yellow-800">
          <li>
            <a href="/guides/adding-features" className="underline">
              Adding New Features →
            </a>
          </li>
          <li>
            <a href="/architecture/database-schema" className="underline">
              Database Schema Details →
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}