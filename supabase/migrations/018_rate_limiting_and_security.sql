-- Rate Limiting and Security Hardening Migration
-- This migration adds tables and functions for rate limiting, security monitoring, and threat detection

-- Create rate_limits table for organization-specific rate limiting
CREATE TABLE rate_limits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    window_ms INTEGER NOT NULL DEFAULT 900000, -- 15 minutes
    max_requests INTEGER NOT NULL DEFAULT 100,
    enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    
    UNIQUE(organization_id, endpoint)
);

-- Add RLS policies for rate_limits
ALTER TABLE rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rate limits are viewable by organization members" 
    ON rate_limits FOR SELECT 
    TO authenticated 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND status = 'active'
        )
    );

CREATE POLICY "Rate limits are manageable by organization admins" 
    ON rate_limits FOR ALL 
    TO authenticated 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- Create security_events table for threat monitoring
CREATE TABLE security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type VARCHAR(50) NOT NULL CHECK (type IN (
        'SUSPICIOUS_ACTIVITY', 'RATE_LIMIT_EXCEEDED', 'PERMISSION_DENIED', 
        'INVALID_TOKEN', 'BRUTE_FORCE', 'SQL_INJECTION', 'XSS_ATTEMPT', 
        'UNAUTHORIZED_ACCESS'
    )),
    severity VARCHAR(20) NOT NULL CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address INET,
    user_agent TEXT,
    endpoint VARCHAR(255),
    details JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID REFERENCES auth.users(id)
);

-- Add indexes for security_events
CREATE INDEX idx_security_events_org_id ON security_events(organization_id);
CREATE INDEX idx_security_events_type ON security_events(type);
CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_created_at ON security_events(created_at);
CREATE INDEX idx_security_events_ip ON security_events(ip_address);

-- Add RLS policies for security_events
ALTER TABLE security_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Security events are viewable by organization admins" 
    ON security_events FOR SELECT 
    TO authenticated 
    USING (
        organization_id IN (
            SELECT organization_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
        OR auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'system_admin'
        )
    );

CREATE POLICY "Security events are manageable by system admins" 
    ON security_events FOR ALL 
    TO authenticated 
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE raw_user_meta_data->>'role' = 'system_admin'
        )
    );

-- Create enhanced usage_quotas table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'usage_quotas') THEN
        CREATE TABLE usage_quotas (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            resource_type VARCHAR(50) NOT NULL,
            limit_value INTEGER NOT NULL DEFAULT -1, -- -1 means unlimited
            current_value INTEGER NOT NULL DEFAULT 0,
            period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (period IN ('daily', 'weekly', 'monthly', 'yearly')),
            reset_at TIMESTAMP WITH TIME ZONE DEFAULT (date_trunc('month', now()) + interval '1 month'),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
            
            UNIQUE(organization_id, resource_type, period)
        );
        
        -- Add indexes
        CREATE INDEX idx_usage_quotas_org_resource ON usage_quotas(organization_id, resource_type);
        CREATE INDEX idx_usage_quotas_reset_at ON usage_quotas(reset_at);
        
        -- Enable RLS
        ALTER TABLE usage_quotas ENABLE ROW LEVEL SECURITY;
        
        CREATE POLICY "Usage quotas are viewable by organization members" 
            ON usage_quotas FOR SELECT 
            TO authenticated 
            USING (
                organization_id IN (
                    SELECT organization_id 
                    FROM organization_members 
                    WHERE user_id = auth.uid() 
                    AND status = 'active'
                )
            );
        
        CREATE POLICY "Usage quotas are manageable by organization admins" 
            ON usage_quotas FOR ALL 
            TO authenticated 
            USING (
                organization_id IN (
                    SELECT organization_id 
                    FROM organization_members 
                    WHERE user_id = auth.uid() 
                    AND role IN ('owner', 'admin')
                    AND status = 'active'
                )
            );
    END IF;
END
$$;

-- Function to increment usage quotas safely
CREATE OR REPLACE FUNCTION increment_usage_quota(
    p_organization_id UUID,
    p_resource_type VARCHAR(50),
    p_increment_by INTEGER DEFAULT 1
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_quota_record usage_quotas%ROWTYPE;
    v_new_value INTEGER;
BEGIN
    -- Lock the quota record for update
    SELECT * INTO v_quota_record
    FROM usage_quotas
    WHERE organization_id = p_organization_id
    AND resource_type = p_resource_type
    FOR UPDATE;
    
    IF NOT FOUND THEN
        -- Create default quota if not exists
        INSERT INTO usage_quotas (
            organization_id,
            resource_type,
            current_value,
            limit_value
        ) VALUES (
            p_organization_id,
            p_resource_type,
            p_increment_by,
            CASE p_resource_type
                WHEN 'api_calls' THEN 10000
                WHEN 'projects' THEN 10
                WHEN 'workspaces' THEN 5
                WHEN 'team_members' THEN 10
                WHEN 'storage_gb' THEN 5
                ELSE -1 -- Unlimited
            END
        );
        RETURN true;
    END IF;
    
    -- Check if quota has expired and needs reset
    IF v_quota_record.reset_at <= now() THEN
        -- Reset the quota
        v_new_value := p_increment_by;
        
        UPDATE usage_quotas
        SET current_value = v_new_value,
            reset_at = CASE v_quota_record.period
                WHEN 'daily' THEN date_trunc('day', now()) + interval '1 day'
                WHEN 'weekly' THEN date_trunc('week', now()) + interval '1 week'
                WHEN 'monthly' THEN date_trunc('month', now()) + interval '1 month'
                WHEN 'yearly' THEN date_trunc('year', now()) + interval '1 year'
                ELSE v_quota_record.reset_at + interval '1 month'
            END,
            updated_at = now()
        WHERE id = v_quota_record.id;
    ELSE
        -- Increment current usage
        v_new_value := v_quota_record.current_value + p_increment_by;
        
        -- Check if limit exceeded (if limit is set)
        IF v_quota_record.limit_value > 0 AND v_new_value > v_quota_record.limit_value THEN
            -- Log quota exceeded event
            INSERT INTO security_events (
                type,
                severity,
                organization_id,
                details
            ) VALUES (
                'RATE_LIMIT_EXCEEDED',
                'MEDIUM',
                p_organization_id,
                jsonb_build_object(
                    'resource_type', p_resource_type,
                    'current_value', v_new_value,
                    'limit_value', v_quota_record.limit_value,
                    'reason', 'Usage quota exceeded'
                )
            );
            
            RETURN false; -- Quota exceeded
        END IF;
        
        UPDATE usage_quotas
        SET current_value = v_new_value,
            updated_at = now()
        WHERE id = v_quota_record.id;
    END IF;
    
    RETURN true;
END;
$$;

-- Function to get organization security summary
CREATE OR REPLACE FUNCTION get_security_summary(
    p_organization_id UUID,
    p_days INTEGER DEFAULT 7
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_result JSONB := '{}';
    v_start_date TIMESTAMP WITH TIME ZONE;
    v_total_events INTEGER;
    v_critical_events INTEGER;
    v_high_events INTEGER;
    v_failed_logins INTEGER;
    v_suspicious_ips JSONB;
BEGIN
    v_start_date := now() - (p_days || ' days')::interval;
    
    -- Get total security events
    SELECT COUNT(*) INTO v_total_events
    FROM security_events
    WHERE organization_id = p_organization_id
    AND created_at >= v_start_date;
    
    -- Get critical events
    SELECT COUNT(*) INTO v_critical_events
    FROM security_events
    WHERE organization_id = p_organization_id
    AND severity = 'CRITICAL'
    AND created_at >= v_start_date;
    
    -- Get high severity events
    SELECT COUNT(*) INTO v_high_events
    FROM security_events
    WHERE organization_id = p_organization_id
    AND severity = 'HIGH'
    AND created_at >= v_start_date;
    
    -- Get failed login attempts
    SELECT COUNT(*) INTO v_failed_logins
    FROM audit_logs
    WHERE organization_id = p_organization_id
    AND action = 'failed_login'
    AND created_at >= v_start_date;
    
    -- Get suspicious IPs (more than 10 events)
    SELECT jsonb_agg(
        jsonb_build_object(
            'ip', ip_address,
            'event_count', event_count
        )
    ) INTO v_suspicious_ips
    FROM (
        SELECT ip_address, COUNT(*) as event_count
        FROM security_events
        WHERE organization_id = p_organization_id
        AND created_at >= v_start_date
        AND ip_address IS NOT NULL
        GROUP BY ip_address
        HAVING COUNT(*) > 10
        ORDER BY COUNT(*) DESC
        LIMIT 10
    ) suspicious;
    
    -- Build result
    v_result := jsonb_build_object(
        'total_events', v_total_events,
        'critical_events', v_critical_events,
        'high_events', v_high_events,
        'failed_logins', v_failed_logins,
        'suspicious_ips', COALESCE(v_suspicious_ips, '[]'::jsonb),
        'period_days', p_days
    );
    
    RETURN v_result;
END;
$$;

-- Function to clean up old security events (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_security_events(
    p_days_to_keep INTEGER DEFAULT 90
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_deleted INTEGER;
BEGIN
    DELETE FROM security_events
    WHERE created_at < (now() - (p_days_to_keep || ' days')::interval)
    AND severity IN ('LOW', 'MEDIUM');
    
    GET DIAGNOSTICS v_deleted = ROW_COUNT;
    
    -- Keep HIGH and CRITICAL events for longer (1 year)
    DELETE FROM security_events
    WHERE created_at < (now() - '1 year'::interval);
    
    RETURN v_deleted;
END;
$$;

-- Create default rate limits for system
INSERT INTO rate_limits (organization_id, endpoint, window_ms, max_requests, enabled)
SELECT 
    id as organization_id,
    endpoint,
    window_ms,
    max_requests,
    true as enabled
FROM organizations, (
    VALUES 
        ('api/workspaces', 900000, 100),    -- 15 min, 100 requests
        ('api/projects', 900000, 200),      -- 15 min, 200 requests  
        ('api/billing', 3600000, 10),       -- 1 hour, 10 requests
        ('api/audit', 3600000, 50),         -- 1 hour, 50 requests
        ('api/members', 900000, 50),        -- 15 min, 50 requests
        ('api/auth', 900000, 20),           -- 15 min, 20 requests
        ('global', 900000, 500)             -- 15 min, 500 requests
) AS defaults(endpoint, window_ms, max_requests)
ON CONFLICT (organization_id, endpoint) DO NOTHING;

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_rate_limits_updated_at
    BEFORE UPDATE ON rate_limits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_quotas_updated_at
    BEFORE UPDATE ON usage_quotas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;