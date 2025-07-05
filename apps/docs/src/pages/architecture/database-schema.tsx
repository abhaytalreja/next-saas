export default function DatabaseSchemaPage() {
  return (
    <div className="prose max-w-none">
      <h1>Database Schema</h1>
      
      <p>
        This guide provides a comprehensive overview of the NextSaaS database architecture, 
        including all tables, relationships, and key design decisions.
      </p>

      <h2>🏗️ Architecture Overview</h2>
      
      <p>NextSaaS uses a modern, scalable database architecture designed for multi-tenant SaaS applications:</p>
      
      <ul>
        <li><strong>Database</strong>: PostgreSQL with Supabase</li>
        <li><strong>Security</strong>: Row Level Security (RLS) for tenant isolation</li>
        <li><strong>Real-time</strong>: Built-in real-time subscriptions</li>
        <li><strong>Type Safety</strong>: Full TypeScript integration</li>
        <li><strong>Flexibility</strong>: JSONB fields for extensibility</li>
      </ul>

      <h2>📊 Core Tables</h2>

      <h3>Authentication & Users</h3>

      <h4>users</h4>
      <p>The central user table storing all user profile information.</p>

      <pre><code>{`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE NOT NULL,
  email_verified_at TIMESTAMPTZ,
  name TEXT,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'UTC',
  locale TEXT DEFAULT 'en',
  metadata JSONB DEFAULT '{}',
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ -- Soft delete support
);`}</code></pre>

      <p><strong>Key Features:</strong></p>
      <ul>
        <li>Soft delete support for data recovery</li>
        <li>Extensible metadata field for custom user data</li>
        <li>Timezone and locale for internationalization</li>
        <li>Email verification tracking</li>
      </ul>

      <h4>sessions</h4>
      <p>Active user sessions with device tracking.</p>

      <pre><code>{`CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  device_info JSONB,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</code></pre>

      <h4>oauth_accounts</h4>
      <p>Third-party authentication provider connections.</p>

      <pre><code>{`CREATE TABLE oauth_accounts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  access_token TEXT,
  refresh_token TEXT,
  expires_at TIMESTAMPTZ,
  token_type TEXT,
  scope TEXT,
  id_token TEXT,
  session_state TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(provider, provider_account_id)
);`}</code></pre>

      <h3>Multi-Tenant Organizations</h3>

      <h4>organizations</h4>
      <p>The core tenant boundary for data isolation.</p>

      <pre><code>{`CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  domain TEXT UNIQUE,
  logo_url TEXT,
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  subscription_status TEXT DEFAULT 'trial',
  trial_ends_at TIMESTAMPTZ,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);`}</code></pre>

      <p><strong>Key Features:</strong></p>
      <ul>
        <li>Unique slug for URL routing</li>
        <li>Custom domain support</li>
        <li>Flexible settings and metadata storage</li>
        <li>Built-in subscription status tracking</li>
      </ul>

      <h4>memberships</h4>
      <p>User-Organization relationships with role-based access.</p>

      <pre><code>{`CREATE TABLE memberships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member')),
  permissions TEXT[] DEFAULT '{}',
  invited_by UUID REFERENCES users(id),
  invited_at TIMESTAMPTZ,
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, organization_id)
);`}</code></pre>

      <p><strong>Roles:</strong></p>
      <ul>
        <li><strong>owner</strong>: Full control, billing access, can delete organization</li>
        <li><strong>admin</strong>: Manage members, settings, and content</li>
        <li><strong>member</strong>: Basic access to organization resources</li>
      </ul>

      <h3>Billing & Subscriptions</h3>

      <h4>plans</h4>
      <p>Pricing tiers with features and limits.</p>

      <pre><code>{`CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price_monthly INTEGER,
  price_yearly INTEGER,
  currency TEXT DEFAULT 'USD',
  features TEXT[] DEFAULT '{}',
  limits JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  is_default BOOLEAN DEFAULT false,
  stripe_price_id_monthly TEXT,
  stripe_price_id_yearly TEXT,
  stripe_product_id TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</code></pre>

      <p><strong>Example Limits:</strong></p>
      <pre><code>{`{
  "users": 10,
  "projects": 50,
  "storage_gb": 100,
  "api_calls_per_month": 10000
}`}</code></pre>

      <h4>subscriptions</h4>
      <p>Active organization subscriptions.</p>

      <pre><code>{`CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES plans(id),
  stripe_subscription_id TEXT UNIQUE,
  stripe_customer_id TEXT,
  status TEXT NOT NULL,
  billing_cycle TEXT CHECK (billing_cycle IN ('monthly', 'yearly')),
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT false,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);`}</code></pre>

      <h3>Content Management</h3>

      <h4>projects</h4>
      <p>Flexible containers for organizing content.</p>

      <pre><code>{`CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  type TEXT DEFAULT 'general',
  settings JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  UNIQUE(organization_id, slug)
);`}</code></pre>

      <p><strong>Project Types:</strong></p>
      <ul>
        <li><code>general</code>: Default project type</li>
        <li><code>real_estate</code>: Property management</li>
        <li><code>crypto</code>: Cryptocurrency portfolio</li>
        <li><code>ecommerce</code>: Online store</li>
        <li><code>custom</code>: User-defined type</li>
      </ul>

      <h4>items</h4>
      <p>Generic content items supporting any data structure.</p>

      <pre><code>{`CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES items(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT,
  description TEXT,
  content TEXT,
  data JSONB DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  status TEXT DEFAULT 'active',
  priority INTEGER DEFAULT 0,
  position INTEGER DEFAULT 0,
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  due_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);`}</code></pre>

      <p><strong>Flexible Design:</strong></p>
      <ul>
        <li>Hierarchical structure via <code>parent_id</code></li>
        <li>Type field for different content types</li>
        <li>JSONB <code>data</code> field for type-specific attributes</li>
        <li>Tags for categorization</li>
        <li>Assignment and due dates for task management</li>
      </ul>

      <h4>custom_fields</h4>
      <p>Dynamic field definitions for extending entities.</p>

      <pre><code>{`CREATE TABLE custom_fields (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL,
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL,
  field_options JSONB DEFAULT '{}',
  validation_rules JSONB DEFAULT '{}',
  default_value JSONB,
  is_required BOOLEAN DEFAULT false,
  is_searchable BOOLEAN DEFAULT true,
  is_visible BOOLEAN DEFAULT true,
  help_text TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(organization_id, entity_type, field_name)
);`}</code></pre>

      <p><strong>Field Types:</strong></p>
      <ul>
        <li><code>text</code>, <code>number</code>, <code>date</code>, <code>select</code>, <code>multiselect</code></li>
        <li><code>boolean</code>, <code>json</code>, <code>file</code></li>
      </ul>

      <h3>System & Monitoring</h3>

      <h4>audit_logs</h4>
      <p>Complete change history for compliance and debugging.</p>

      <pre><code>{`CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_name TEXT NOT NULL,
  record_id UUID NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_fields TEXT[],
  user_id UUID REFERENCES users(id),
  organization_id UUID,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</code></pre>

      <h4>activities</h4>
      <p>User activity feed for recent actions.</p>

      <pre><code>{`CREATE TABLE activities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  entity_title TEXT,
  description TEXT,
  metadata JSONB DEFAULT '{}',
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);`}</code></pre>

      <h2>🔐 Security Features</h2>

      <h3>Row Level Security (RLS)</h3>

      <p>All tables have RLS policies ensuring data isolation:</p>

      <pre><code>{`-- Example: Users can only see their own organizations
CREATE POLICY "Users view own organizations" ON organizations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM memberships 
      WHERE memberships.organization_id = organizations.id 
      AND memberships.user_id = auth.uid()
    )
  );

-- Example: Organization data isolation
CREATE POLICY "Organization data isolation" ON items
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM memberships 
      WHERE user_id = auth.uid()
    )
  );`}</code></pre>

      <h3>Database Functions</h3>

      <p>Key utility functions:</p>

      <pre><code>{`-- Automatic timestamp updates
CREATE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Check organization membership
CREATE FUNCTION auth.check_org_membership(org_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM memberships 
    WHERE organization_id = org_id 
    AND user_id = user_id
  );
END;
$$ language 'plpgsql';`}</code></pre>

      <h2>🚀 Performance Optimizations</h2>

      <h3>Strategic Indexes</h3>

      <pre><code>{`-- Foreign key indexes
CREATE INDEX idx_memberships_user_id ON memberships(user_id);
CREATE INDEX idx_memberships_organization_id ON memberships(organization_id);
CREATE INDEX idx_items_organization_id ON items(organization_id);
CREATE INDEX idx_items_project_id ON items(project_id);

-- Query optimization indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_items_status ON items(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_type ON items(type) WHERE deleted_at IS NULL;

-- JSONB indexes
CREATE INDEX idx_items_data ON items USING GIN (data);
CREATE INDEX idx_items_tags ON items USING GIN (tags);`}</code></pre>

      <h2>🔄 Real-time Subscriptions</h2>

      <p>Enable real-time for key tables:</p>

      <pre><code>{`-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE items;
ALTER PUBLICATION supabase_realtime ADD TABLE activities;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;`}</code></pre>

      <h2>📝 TypeScript Integration</h2>

      <p>All tables have corresponding TypeScript types:</p>

      <pre><code>{`interface User {
  id: string;
  email: string;
  email_verified_at: string | null;
  name: string | null;
  avatar_url: string | null;
  timezone: string;
  locale: string;
  metadata: Record<string, any>;
  last_seen_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

interface Organization {
  id: string;
  name: string;
  slug: string;
  domain: string | null;
  logo_url: string | null;
  settings: Record<string, any>;
  metadata: Record<string, any>;
  subscription_status: 'trial' | 'active' | 'cancelled' | 'past_due' | 'paused';
  trial_ends_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}`}</code></pre>

      <h2>🛠️ Database Management</h2>

      <h3>Migrations</h3>

      <p>Database changes are managed through migration files:</p>

      <pre><code>{`# Create a new migration
npm run migrate:create add_new_feature

# Run migrations
npm run migrate:up

# Rollback
npm run migrate:down`}</code></pre>

      <h3>Seeding</h3>

      <p>Populate development data:</p>

      <pre><code>{`# Run seeders
npm run seed:run

# Reset and seed
npm run seed:reset`}</code></pre>

      <p>
        This database schema provides a solid foundation for building scalable, 
        multi-tenant SaaS applications with NextSaaS.
      </p>
    </div>
  );
}