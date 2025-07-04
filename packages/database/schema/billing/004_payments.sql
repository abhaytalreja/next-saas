-- Payment History
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id),
  stripe_payment_intent_id VARCHAR(255) UNIQUE,
  stripe_charge_id VARCHAR(255) UNIQUE,
  amount INTEGER NOT NULL, -- in cents
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(50),
  payment_method_details JSONB DEFAULT '{}',
  failure_reason TEXT,
  refunded_amount INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_payments_organization_id ON payments(organization_id);
CREATE INDEX idx_payments_invoice_id ON payments(invoice_id);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_stripe_payment_intent_id ON payments(stripe_payment_intent_id);
CREATE INDEX idx_payments_created_at ON payments(created_at);

-- Add comments
COMMENT ON TABLE payments IS 'Payment transaction records';
COMMENT ON COLUMN payments.amount IS 'Payment amount in cents';
COMMENT ON COLUMN payments.status IS 'Payment status (pending, succeeded, failed, refunded)';
COMMENT ON COLUMN payments.payment_method IS 'Payment method type (card, bank_transfer, etc.)';
COMMENT ON COLUMN payments.refunded_amount IS 'Amount refunded in cents';