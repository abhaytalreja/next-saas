-- Organization-specific user profiles for multi-tenant support
-- Allows users to have different profiles for different organizations

-- Organization profiles table
CREATE TABLE IF NOT EXISTS organization_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    
    -- Profile information
    display_name VARCHAR(100) NOT NULL,
    title VARCHAR(100),
    department VARCHAR(100),
    bio TEXT,
    phone VARCHAR(20),
    location VARCHAR(100),
    start_date DATE,
    pronouns VARCHAR(20),
    status VARCHAR(100), -- Current status like "🌴 On vacation", "🏠 Working from home"
    
    -- Skills and expertise
    skills TEXT[], -- Array of skill names
    
    -- Privacy settings
    visibility VARCHAR(20) NOT NULL DEFAULT 'organization' CHECK (visibility IN ('public', 'organization', 'private')),
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one profile per user per organization
    UNIQUE(user_id, organization_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_organization_profiles_user_id ON organization_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_organization_id ON organization_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_visibility ON organization_profiles(visibility);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_department ON organization_profiles(department);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_title ON organization_profiles(title);
CREATE INDEX IF NOT EXISTS idx_organization_profiles_skills ON organization_profiles USING GIN(skills);

-- Trigger for updated_at
CREATE TRIGGER update_organization_profiles_updated_at
    BEFORE UPDATE ON organization_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)
ALTER TABLE organization_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organization_profiles

-- Users can view profiles based on visibility settings
CREATE POLICY "Users can view organization profiles based on visibility"
    ON organization_profiles FOR SELECT
    USING (
        CASE visibility
            WHEN 'public' THEN true
            WHEN 'organization' THEN EXISTS (
                SELECT 1 FROM memberships m
                WHERE om.user_id = auth.uid()
                AND om.organization_id = organization_profiles.organization_id
                            )
            WHEN 'private' THEN auth.uid() = user_id
        END
    );

-- Users can create their own organization profiles
CREATE POLICY "Users can create their own organization profiles"
    ON organization_profiles FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND EXISTS (
            SELECT 1 FROM memberships m
            WHERE m.user_id = auth.uid()
            AND m.organization_id = organization_profiles.organization_id
        )
    );

-- Users can update their own organization profiles
CREATE POLICY "Users can update their own organization profiles"
    ON organization_profiles FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own organization profiles
CREATE POLICY "Users can delete their own organization profiles"
    ON organization_profiles FOR DELETE
    USING (auth.uid() = user_id);

-- Admins can manage all organization profiles in their organizations
CREATE POLICY "Organization admins can manage organization profiles"
    ON organization_profiles FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM memberships m
            WHERE om.user_id = auth.uid()
            AND om.organization_id = organization_profiles.organization_id
            AND m.role IN ('owner', 'admin')
                    )
    );

-- Service role can manage all organization profiles
CREATE POLICY "Service role can manage all organization profiles"
    ON organization_profiles FOR ALL
    USING (auth.role() = 'service_role');

-- Function to get organization profile with member info
CREATE OR REPLACE FUNCTION get_organization_member_profiles(
    p_organization_id UUID,
    p_requesting_user_id UUID DEFAULT NULL
)
RETURNS TABLE (
    profile_id UUID,
    user_id UUID,
    email TEXT,
    display_name TEXT,
    title TEXT,
    department TEXT,
    bio TEXT,
    phone TEXT,
    location TEXT,
    start_date DATE,
    pronouns TEXT,
    status TEXT,
    skills TEXT[],
    visibility TEXT,
    role TEXT,
    member_status TEXT,
    joined_at TIMESTAMPTZ,
    last_seen_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if requesting user has access to this organization
    IF p_requesting_user_id IS NOT NULL THEN
        IF NOT EXISTS (
            SELECT 1 FROM memberships m
            WHERE om.user_id = p_requesting_user_id
            AND om.organization_id = p_organization_id
                    ) THEN
            RAISE EXCEPTION 'Access denied to organization';
        END IF;
    END IF;

    RETURN QUERY
    SELECT 
        op.id as profile_id,
        op.user_id,
        u.email,
        op.display_name,
        op.title,
        op.department,
        op.bio,
        op.phone,
        op.location,
        op.start_date,
        op.pronouns,
        op.status,
        op.skills,
        op.visibility,
        m.role,
        m.accepted_at as member_status,
        m.created_at as joined_at,
        u.last_seen_at
    FROM organization_profiles op
    JOIN memberships m ON op.user_id = om.user_id AND op.organization_id = om.organization_id
    JOIN users u ON op.user_id = u.id
    WHERE op.organization_id = p_organization_id
        AND (
        op.visibility = 'public'
        OR (op.visibility = 'organization' AND (
            p_requesting_user_id IS NULL 
            OR EXISTS (
                SELECT 1 FROM memberships req_om
                WHERE req_om.user_id = p_requesting_user_id
                AND req_om.organization_id = p_organization_id
                            )
        ))
        OR (op.visibility = 'private' AND op.user_id = p_requesting_user_id)
    )
    ORDER BY op.display_name;
END;
$$;

-- Function to search organization profiles
CREATE OR REPLACE FUNCTION search_organization_profiles(
    p_organization_id UUID,
    p_requesting_user_id UUID,
    p_search_query TEXT DEFAULT NULL,
    p_department TEXT DEFAULT NULL,
    p_skills TEXT[] DEFAULT NULL,
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE (
    profile_id UUID,
    user_id UUID,
    display_name TEXT,
    title TEXT,
    department TEXT,
    bio TEXT,
    skills TEXT[],
    role TEXT,
    last_seen_at TIMESTAMPTZ,
    match_score REAL
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Check if requesting user has access to this organization
    IF NOT EXISTS (
        SELECT 1 FROM memberships m
        WHERE om.user_id = p_requesting_user_id
        AND om.organization_id = p_organization_id
            ) THEN
        RAISE EXCEPTION 'Access denied to organization';
    END IF;

    RETURN QUERY
    SELECT 
        op.id as profile_id,
        op.user_id,
        op.display_name,
        op.title,
        op.department,
        op.bio,
        op.skills,
        m.role,
        u.last_seen_at,
        CASE 
            WHEN p_search_query IS NULL THEN 1.0
            ELSE (
                COALESCE(
                    similarity(op.display_name, p_search_query) * 2, 0
                ) +
                COALESCE(
                    similarity(op.title, p_search_query), 0
                ) +
                COALESCE(
                    similarity(op.bio, p_search_query) * 0.5, 0
                )
            )
        END as match_score
    FROM organization_profiles op
    JOIN memberships m ON op.user_id = om.user_id AND op.organization_id = om.organization_id
    JOIN users u ON op.user_id = u.id
    WHERE op.organization_id = p_organization_id
        AND op.visibility IN ('public', 'organization')
    AND (p_search_query IS NULL OR (
        op.display_name ILIKE '%' || p_search_query || '%'
        OR op.title ILIKE '%' || p_search_query || '%'
        OR op.bio ILIKE '%' || p_search_query || '%'
        OR EXISTS (
            SELECT 1 FROM unnest(op.skills) skill
            WHERE skill ILIKE '%' || p_search_query || '%'
        )
    ))
    AND (p_department IS NULL OR op.department = p_department)
    AND (p_skills IS NULL OR op.skills && p_skills)
    ORDER BY match_score DESC, op.display_name
    LIMIT p_limit OFFSET p_offset;
END;
$$;

-- Function to get organization departments and their member counts
CREATE OR REPLACE FUNCTION get_organization_departments(p_organization_id UUID)
RETURNS TABLE (
    department TEXT,
    member_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        op.department,
        COUNT(*)::INTEGER as member_count
    FROM organization_profiles op
    JOIN memberships m ON op.user_id = om.user_id AND op.organization_id = om.organization_id
    WHERE op.organization_id = p_organization_id
        AND op.department IS NOT NULL
    AND op.department != ''
    GROUP BY op.department
    ORDER BY member_count DESC, op.department;
END;
$$;

-- Function to get popular skills in organization
CREATE OR REPLACE FUNCTION get_organization_skills(p_organization_id UUID)
RETURNS TABLE (
    skill TEXT,
    member_count INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        skill_name as skill,
        COUNT(*)::INTEGER as member_count
    FROM organization_profiles op
    JOIN memberships m ON op.user_id = om.user_id AND op.organization_id = om.organization_id,
    unnest(op.skills) as skill_name
    WHERE op.organization_id = p_organization_id
        AND op.skills IS NOT NULL
    GROUP BY skill_name
    ORDER BY member_count DESC, skill_name
    LIMIT 50;
END;
$$;

-- View for organization profile statistics
CREATE OR REPLACE VIEW organization_profile_stats AS
SELECT 
    op.organization_id,
    COUNT(*) as total_profiles,
    COUNT(*) FILTER (WHERE op.visibility = 'public') as public_profiles,
    COUNT(*) FILTER (WHERE op.visibility = 'organization') as organization_profiles,
    COUNT(*) FILTER (WHERE op.visibility = 'private') as private_profiles,
    COUNT(DISTINCT op.department) FILTER (WHERE op.department IS NOT NULL) as departments_count,
    COUNT(DISTINCT skill_name) FILTER (WHERE skill_name IS NOT NULL) as unique_skills_count,
    AVG(array_length(op.skills, 1)) as avg_skills_per_profile
FROM organization_profiles op
JOIN memberships m ON op.user_id = om.user_id AND op.organization_id = om.organization_id
LEFT JOIN unnest(op.skills) as skill_name ON true
GROUP BY op.organization_id;

-- Comments for documentation
COMMENT ON TABLE organization_profiles IS 'Organization-specific user profiles for multi-tenant support';
COMMENT ON COLUMN organization_profiles.visibility IS 'Profile visibility: public (everyone), organization (org members), private (user only)';
COMMENT ON COLUMN organization_profiles.skills IS 'Array of user skills and expertise';
COMMENT ON COLUMN organization_profiles.status IS 'Current user status like vacation, working from home, etc.';
COMMENT ON FUNCTION get_organization_member_profiles(UUID, UUID) IS 'Gets all member profiles in an organization with access control';
COMMENT ON FUNCTION search_organization_profiles(UUID, UUID, TEXT, TEXT, TEXT[], INTEGER, INTEGER) IS 'Searches organization profiles with filters and ranking';
COMMENT ON FUNCTION get_organization_departments(UUID) IS 'Gets departments and member counts for an organization';
COMMENT ON FUNCTION get_organization_skills(UUID) IS 'Gets popular skills and their usage counts in an organization';
COMMENT ON VIEW organization_profile_stats IS 'Statistics about organization profiles';