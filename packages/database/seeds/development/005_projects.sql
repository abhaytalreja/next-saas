-- Development seed data for projects
INSERT INTO projects (id, organization_id, name, slug, description, type, settings, metadata, is_archived, created_by) VALUES
  -- Acme Corp projects
  ('00000000-0000-0000-3000-000000000001', '00000000-0000-0000-1000-000000000001', 'Website Redesign', 'website-redesign', 'Redesigning the company website with modern stack', 'general', '{"color": "blue"}', '{}', false, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-3000-000000000002', '00000000-0000-0000-1000-000000000001', 'Mobile App', 'mobile-app', 'Native mobile app for iOS and Android', 'general', '{"color": "green"}', '{}', false, '00000000-0000-0000-0000-000000000003'),
  
  -- Startup Inc projects
  ('00000000-0000-0000-3000-000000000003', '00000000-0000-0000-1000-000000000002', 'MVP Development', 'mvp-development', 'Building the minimum viable product', 'general', '{"color": "purple"}', '{}', false, '00000000-0000-0000-0000-000000000003'),
  
  -- Enterprise LLC projects
  ('00000000-0000-0000-3000-000000000004', '00000000-0000-0000-1000-000000000003', 'Real Estate Portfolio', 'real-estate-portfolio', 'Managing commercial properties', 'real_estate', '{"currency": "USD", "units": "sqft"}', '{}', false, '00000000-0000-0000-0000-000000000005'),
  ('00000000-0000-0000-3000-000000000005', '00000000-0000-0000-1000-000000000003', 'Crypto Investments', 'crypto-investments', 'Cryptocurrency portfolio tracking', 'crypto', '{"default_currency": "USD", "track_gas": true}', '{}', false, '00000000-0000-0000-0000-000000000002'),
  ('00000000-0000-0000-3000-000000000006', '00000000-0000-0000-1000-000000000003', 'E-commerce Platform', 'ecommerce-platform', 'Online marketplace for B2B sales', 'ecommerce', '{"currency": "USD", "tax_enabled": true}', '{}', false, '00000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;