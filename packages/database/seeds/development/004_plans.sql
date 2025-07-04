-- Development seed data for plans
INSERT INTO plans (id, name, slug, description, price_monthly, price_yearly, currency, features, limits, metadata, is_active, is_default, sort_order) VALUES
  ('00000000-0000-0000-2000-000000000001', 'Free', 'free', 'Perfect for trying out NextSaaS', 0, 0, 'USD', 
   '["Up to 3 team members", "1 project", "Basic support", "1GB storage"]',
   '{"users": 3, "projects": 1, "storage_gb": 1, "api_calls": 1000}',
   '{}', true, true, 0),
  
  ('00000000-0000-0000-2000-000000000002', 'Starter', 'starter', 'Great for small teams', 2900, 29000, 'USD',
   '["Up to 10 team members", "5 projects", "Email support", "10GB storage", "API access", "Custom integrations"]',
   '{"users": 10, "projects": 5, "storage_gb": 10, "api_calls": 10000}',
   '{}', true, false, 1),
  
  ('00000000-0000-0000-2000-000000000003', 'Professional', 'professional', 'For growing businesses', 9900, 99000, 'USD',
   '["Up to 50 team members", "Unlimited projects", "Priority support", "100GB storage", "Advanced API access", "Custom integrations", "Analytics dashboard", "White labeling"]',
   '{"users": 50, "projects": -1, "storage_gb": 100, "api_calls": 100000}',
   '{"popular": true}', true, false, 2),
  
  ('00000000-0000-0000-2000-000000000004', 'Enterprise', 'enterprise', 'For large organizations', 29900, 299000, 'USD',
   '["Unlimited team members", "Unlimited projects", "24/7 phone support", "1TB storage", "Dedicated account manager", "Custom contracts", "SLA guarantee", "On-premise deployment option"]',
   '{"users": -1, "projects": -1, "storage_gb": 1000, "api_calls": -1}',
   '{}', true, false, 3)
ON CONFLICT (id) DO NOTHING;