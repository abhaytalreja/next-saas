-- E2E Test Organizations
-- Organizations for comprehensive E2E testing scenarios

-- Clear existing test organizations
DELETE FROM organizations WHERE name LIKE 'Test %' OR name LIKE '%Test' OR metadata::text LIKE '%test_account%';

-- Test Organizations
INSERT INTO organizations (id, name, domain, metadata, settings, created_by, created_at, updated_at) VALUES
  -- Main test organization
  ('20000000-0000-0000-0000-000000000001', 'Acme Corporation', 'acme-test.com', '{"type": "business", "test_account": true, "industry": "technology"}', '{"features": {"billing": true, "advanced_analytics": true, "custom_branding": true}, "limits": {"users": 100, "projects": 50}}', '10000000-0000-0000-0000-000000000001', NOW(), NOW()),
  
  -- Technology startup for multi-org testing
  ('20000000-0000-0000-0000-000000000002', 'Tech Startup Inc', 'techstartup-test.io', '{"type": "startup", "test_account": true, "industry": "technology"}', '{"features": {"billing": true, "advanced_analytics": false, "custom_branding": false}, "limits": {"users": 25, "projects": 10}}', '10000000-0000-0000-0000-000000000002', NOW(), NOW()),
  
  -- Enterprise organization for advanced testing
  ('20000000-0000-0000-0000-000000000003', 'Enterprise Corp', 'enterprise-test.com', '{"type": "enterprise", "test_account": true, "industry": "finance"}', '{"features": {"billing": true, "advanced_analytics": true, "custom_branding": true, "sso": true, "audit_logs": true}, "limits": {"users": 1000, "projects": 200}}', '10000000-0000-0000-0000-000000000001', NOW(), NOW()),
  
  -- Consulting firm for professional services testing
  ('20000000-0000-0000-0000-000000000004', 'Consulting Firm LLC', 'consulting-test.biz', '{"type": "consulting", "test_account": true, "industry": "professional_services"}', '{"features": {"billing": true, "advanced_analytics": true, "custom_branding": false}, "limits": {"users": 50, "projects": 25}}', '10000000-0000-0000-0000-000000000004', NOW(), NOW()),
  
  -- Mobile-first organization for mobile testing
  ('20000000-0000-0000-0000-000000000005', 'Mobile First Co', 'mobile-test.app', '{"type": "mobile_app", "test_account": true, "industry": "technology"}', '{"features": {"mobile_optimized": true, "push_notifications": true}, "limits": {"users": 20, "projects": 5}}', '10000000-0000-0000-0000-000000000005', NOW(), NOW()),
  
  -- Organization for incomplete user testing
  ('20000000-0000-0000-0000-000000000006', 'Startup Co', 'startup-test.co', '{"type": "startup", "test_account": true, "industry": "technology"}', '{"features": {"billing": false}, "limits": {"users": 10, "projects": 3}}', '10000000-0000-0000-0000-000000000007', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  domain = EXCLUDED.domain,
  metadata = EXCLUDED.metadata,
  settings = EXCLUDED.settings,
  updated_at = NOW();

-- Organization Profiles for test organizations
INSERT INTO organization_profiles (organization_id, display_name, logo_url, description, website, industry, size, location, contact_email, contact_phone, settings, created_at, updated_at) VALUES
  ('20000000-0000-0000-0000-000000000001', 'Acme Corporation', 'https://api.dicebear.com/7.x/identicon/svg?seed=acme', 'Leading technology company focused on innovative solutions', 'https://acme-test.com', 'Technology', '50-100', 'San Francisco, CA', 'contact@acme-test.com', '+1-555-0100', '{"public_profile": true, "show_team": true}', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000002', 'Tech Startup Inc', 'https://api.dicebear.com/7.x/identicon/svg?seed=techstartup', 'Fast-growing technology startup building the future', 'https://techstartup-test.io', 'Technology', '10-25', 'Austin, TX', 'hello@techstartup-test.io', '+1-555-0200', '{"public_profile": true, "show_team": false}', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000003', 'Enterprise Corp', 'https://api.dicebear.com/7.x/identicon/svg?seed=enterprise', 'Fortune 500 company with global operations', 'https://enterprise-test.com', 'Finance', '1000+', 'New York, NY', 'info@enterprise-test.com', '+1-555-0300', '{"public_profile": false, "show_team": false}', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000004', 'Consulting Firm LLC', 'https://api.dicebear.com/7.x/identicon/svg?seed=consulting', 'Professional consulting services for businesses', 'https://consulting-test.biz', 'Professional Services', '25-50', 'Chicago, IL', 'services@consulting-test.biz', '+1-555-0400', '{"public_profile": true, "show_team": true}', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000005', 'Mobile First Co', 'https://api.dicebear.com/7.x/identicon/svg?seed=mobile', 'Mobile-first technology solutions', 'https://mobile-test.app', 'Technology', '10-25', 'Seattle, WA', 'team@mobile-test.app', '+1-555-0500', '{"public_profile": true, "show_team": true, "mobile_optimized": true}', NOW(), NOW()),
  ('20000000-0000-0000-0000-000000000006', 'Startup Co', NULL, 'Early stage startup', NULL, 'Technology', '1-10', 'Remote', NULL, NULL, '{"public_profile": false, "show_team": false}', NOW(), NOW())
ON CONFLICT (organization_id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  logo_url = EXCLUDED.logo_url,
  description = EXCLUDED.description,
  website = EXCLUDED.website,
  industry = EXCLUDED.industry,
  size = EXCLUDED.size,
  location = EXCLUDED.location,
  contact_email = EXCLUDED.contact_email,
  contact_phone = EXCLUDED.contact_phone,
  settings = EXCLUDED.settings,
  updated_at = NOW();