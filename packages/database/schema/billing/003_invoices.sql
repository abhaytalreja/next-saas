-- Invoices
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  subscription_id UUID REFERENCES subscriptions(id),
  stripe_invoice_id VARCHAR(255) UNIQUE,
  invoice_number VARCHAR(100) UNIQUE,
  status VARCHAR(50) NOT NULL DEFAULT 'draft',
  amount_total INTEGER NOT NULL, -- in cents
  amount_paid INTEGER DEFAULT 0,
  amount_due INTEGER NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  line_items JSONB DEFAULT '[]',
  billing_details JSONB DEFAULT '{}',
  due_date DATE,
  paid_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_invoices_organization_id ON invoices(organization_id);
CREATE INDEX idx_invoices_subscription_id ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_stripe_invoice_id ON invoices(stripe_invoice_id);
CREATE INDEX idx_invoices_created_at ON invoices(created_at);

-- Add comments
COMMENT ON TABLE invoices IS 'Invoice records for billing';
COMMENT ON COLUMN invoices.amount_total IS 'Total invoice amount in cents';
COMMENT ON COLUMN invoices.status IS 'Invoice status (draft, open, paid, void, uncollectible)';
COMMENT ON COLUMN invoices.line_items IS 'Array of invoice line items';
COMMENT ON COLUMN invoices.billing_details IS 'Customer billing information';