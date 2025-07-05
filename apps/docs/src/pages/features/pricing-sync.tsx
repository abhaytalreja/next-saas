export default function PricingSyncPage() {
  return (
    <div className="prose max-w-none">
      <h1>💰 Pricing Sync with Database</h1>
      
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-900 font-semibold mb-1">✅ Automatic Synchronization</p>
        <p className="text-green-800">
          Your pricing plans are automatically synced between the database and the landing page. 
          Update pricing in one place and see it reflected everywhere!
        </p>
      </div>

      <h2>🔍 How It Works</h2>
      
      <p>The pricing sync system ensures your marketing site always displays accurate, up-to-date pricing:</p>
      
      <ol>
        <li>Pricing plans are stored in the <code>plans</code> table in your database</li>
        <li>The landing page fetches pricing server-side on each request</li>
        <li>Changes to pricing are immediately reflected without code changes</li>
        <li>Fallback pricing is used if the database is unavailable</li>
      </ol>

      <h2>🗄️ Database Schema</h2>
      
      <p>The pricing plans table structure:</p>
      
      <pre><code>{`CREATE TABLE plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,               -- "Starter", "Pro", "Enterprise"
  slug text UNIQUE NOT NULL,        -- "starter", "pro", "enterprise"
  price_monthly integer NOT NULL,   -- Price in cents (999 = $9.99)
  price_yearly integer NOT NULL,    -- Yearly price in cents
  currency text DEFAULT 'USD',      -- Currency code
  features text[],                  -- Array of feature descriptions
  limits jsonb NOT NULL,            -- {"users": 10, "projects": 50, ...}
  stripe_price_id_monthly text,     -- Stripe price ID for monthly
  stripe_price_id_yearly text,      -- Stripe price ID for yearly
  is_active boolean DEFAULT true,   -- Show/hide plans
  is_default boolean DEFAULT false, -- Default plan for new signups
  sort_order integer DEFAULT 999,   -- Display order
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);`}</code></pre>

      <h2>🛠️ Managing Pricing Plans</h2>

      <h3>Update Pricing via SQL</h3>
      
      <pre><code>{`-- Update monthly price for Pro plan
UPDATE plans 
SET price_monthly = 3900  -- $39.00
WHERE slug = 'pro';

-- Add a new feature to Starter plan
UPDATE plans 
SET features = array_append(features, 'New Feature!')
WHERE slug = 'starter';

-- Change display order
UPDATE plans SET sort_order = 1 WHERE slug = 'starter';
UPDATE plans SET sort_order = 2 WHERE slug = 'pro';
UPDATE plans SET sort_order = 3 WHERE slug = 'enterprise';

-- Hide a plan (keeps data but removes from display)
UPDATE plans SET is_active = false WHERE slug = 'legacy';`}</code></pre>

      <h3>Add New Plans</h3>
      
      <pre><code>{`INSERT INTO plans (
  name, slug, price_monthly, price_yearly, 
  features, limits, sort_order
) VALUES (
  'Team',
  'team',
  4900,  -- $49/month
  49000, -- $490/year
  ARRAY[
    '25 team members',
    '100 projects',
    '500GB storage',
    '500,000 API calls/month',
    'Priority support',
    'Advanced analytics'
  ],
  '{"users": 25, "projects": 100, "storage_gb": 500, "api_calls": 500000}'::jsonb,
  3
);`}</code></pre>

      <h2>🎨 Customizing the Display</h2>

      <h3>Pricing Component Location</h3>
      
      <p>The pricing display components are located at:</p>
      
      <ul>
        <li><code>/apps/landing/src/components/pricing-section.tsx</code> - Client component with UI</li>
        <li><code>/apps/landing/src/components/pricing-section-server.tsx</code> - Server component that fetches data</li>
        <li><code>/apps/landing/src/lib/pricing.ts</code> - Database fetch logic</li>
      </ul>

      <h3>Customization Options</h3>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="text-blue-900 font-semibold mb-2">What You Can Customize:</h4>
        <ul className="text-blue-800 space-y-1">
          <li>• Plan highlighting (currently highlights "pro" plan)</li>
          <li>• Currency display format</li>
          <li>• Feature icons and descriptions</li>
          <li>• Call-to-action button text</li>
          <li>• Monthly/yearly toggle behavior</li>
          <li>• Color scheme and styling</li>
        </ul>
      </div>

      <h2>🔧 Implementation Details</h2>

      <h3>Server-Side Fetching</h3>
      
      <p>The pricing data is fetched server-side for optimal performance and SEO:</p>
      
      <pre><code>{`// In pricing-section-server.tsx
export async function PricingSectionWithData() {
  // Runs on the server - no client-side API calls
  const plans = await fetchPricingPlans();
  
  // Pass data to client component
  return <PricingSection plans={plans} />;
}`}</code></pre>

      <h3>Fallback Mechanism</h3>
      
      <p>If the database is unavailable, the system uses hardcoded fallback plans:</p>
      
      <pre><code>{`// In lib/pricing.ts
export async function fetchPricingPlans(): Promise<PricingPlan[]> {
  const supabase = createSupabaseServerClient();
  
  const { data, error } = await supabase
    .from('plans')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');

  if (error) {
    console.error('Error fetching pricing:', error);
    return getDefaultPlans(); // Returns hardcoded plans
  }

  return data;
}`}</code></pre>

      <h2>🚀 Best Practices</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 not-prose mb-6">
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">✅ Do</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Store prices in cents to avoid decimals</li>
            <li>• Use <code>is_active</code> to hide plans</li>
            <li>• Keep feature lists concise</li>
            <li>• Test pricing changes in dev first</li>
            <li>• Use <code>sort_order</code> for positioning</li>
          </ul>
        </div>
        
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold mb-2">❌ Don't</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Delete plans (use <code>is_active = false</code>)</li>
            <li>• Store prices as decimals</li>
            <li>• Hardcode prices in the UI</li>
            <li>• Forget to update Stripe price IDs</li>
            <li>• Mix currencies in one deployment</li>
          </ul>
        </div>
      </div>

      <h2>🔍 Monitoring & Debugging</h2>

      <h3>Check Current Pricing</h3>
      
      <pre><code>{`-- View all active plans
SELECT name, slug, price_monthly, price_yearly, sort_order 
FROM plans 
WHERE is_active = true 
ORDER BY sort_order;

-- Check feature lists
SELECT name, features 
FROM plans 
WHERE is_active = true;

-- View plan limits
SELECT name, limits 
FROM plans 
WHERE is_active = true;`}</code></pre>

      <h3>Common Issues</h3>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="text-yellow-900 font-semibold mb-2">🔧 Troubleshooting</h4>
        <ul className="text-yellow-800 space-y-2">
          <li>
            <strong>Pricing not updating:</strong> 
            <span className="text-sm"> Check that Row Level Security (RLS) allows public read access to the plans table</span>
          </li>
          <li>
            <strong>Fallback plans showing:</strong> 
            <span className="text-sm"> Verify database connection and check server logs for errors</span>
          </li>
          <li>
            <strong>Wrong order:</strong> 
            <span className="text-sm"> Update <code>sort_order</code> values - lower numbers appear first</span>
          </li>
        </ul>
      </div>

      <h2>🎯 Integration with Billing</h2>
      
      <p>The pricing plans integrate with the subscription system:</p>
      
      <ol>
        <li>When users select a plan, the <code>plan.id</code> is used to create subscriptions</li>
        <li>The <code>limits</code> JSON is used for enforcing usage restrictions</li>
        <li>Stripe price IDs link to your Stripe dashboard for payment processing</li>
        <li>The <code>is_default</code> plan is assigned to new organizations</li>
      </ol>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-8">
        <h3 className="text-green-900 font-semibold mb-2">✨ Pro Tip</h3>
        <p className="text-green-800">
          You can A/B test pricing by creating multiple active plans and using feature flags or 
          user segments to show different pricing to different users!
        </p>
      </div>
    </div>
  );
}