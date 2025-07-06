# 🔄 Organization Modes Comparison

This document provides a detailed comparison of the three organization modes available in NextSaaS.

## 📊 Quick Comparison Table

| Feature | `none` | `single` | `multi` |
|---------|--------|----------|---------|
| **Organizations** | ❌ No organizations | ✅ 1 per user (auto-created) | ✅ Multiple per user |
| **Target Use Case** | Personal tools | Small teams, Freelancers | Enterprise B2B |
| **Billing Model** | Per user | Per organization | Per organization + seats |
| **User Management** | Individual only | Basic team | Full RBAC |
| **Invitations** | ❌ Not supported | ✅ Email invites | ✅ Email invites |
| **Roles** | ❌ Not applicable | ✅ Owner only* | ✅ Owner, Admin, Member |
| **Custom Domains** | ❌ Not supported | ⚠️ Future option | ✅ Supported |
| **Data Isolation** | By user | By organization | By organization |
| **Complexity** | 🟢 Simple | 🟡 Moderate | 🔴 Complex |

*In single mode, the creating user is always the owner

## 🎯 When to Use Each Mode

### Use `none` when:
- Building personal productivity tools
- Creating individual creator tools
- Developing portfolio or resume builders
- Making journaling or note-taking apps
- Building simple utilities

**Examples**: Personal todo app, diet tracker, expense tracker, personal blog CMS

### Use `single` when:
- Building for freelancers or consultants
- Creating small team collaboration tools
- Developing project management for startups
- Making tools where users need one workspace
- Planning to potentially upgrade to multi-org later

**Examples**: Freelancer invoicing, small team project management, family budget tracker

### Use `multi` when:
- Building enterprise B2B SaaS
- Creating tools for agencies with multiple clients
- Developing platforms where users belong to multiple companies
- Making collaboration tools across organizations
- Building marketplace or platform businesses

**Examples**: Slack, Notion, Linear, GitHub, Figma

## 🗂️ Database Structure Differences

### Tables by Mode

| Table | `none` | `single` | `multi` |
|-------|--------|----------|---------|
| **profiles** | ✅ | ✅ | ✅ |
| **plans** | ✅ | ✅ | ✅ |
| **projects** | ✅ (user-owned) | ✅ (org-owned) | ✅ (org-owned) |
| **items** | ✅ (user-owned) | ✅ (org-owned) | ✅ (org-owned) |
| **subscriptions** | ✅ (user-based) | ✅ (org-based) | ✅ (org-based) |
| **usage_tracking** | ✅ (user-based) | ✅ (org-based) | ✅ (org-based) |
| **organizations** | ❌ | ✅ | ✅ |
| **organization_members** | ❌ | ✅ | ✅ |
| **organization_invitations** | ❌ | ✅ | ✅ |

### Ownership Model

#### Mode: `none`
```
User → Projects → Items
User → Subscription
```

#### Mode: `single`
```
User → Organization (1:1) → Projects → Items
Organization → Subscription
```

#### Mode: `multi`
```
User ↔ Organizations (N:M) → Projects → Items
Organization → Subscription
```

## 💰 Billing Implications

### `none` Mode
- **Billing Unit**: Individual user
- **Stripe Customer**: User email
- **Subscription**: Tied to user account
- **Limits**: Applied per user
- **Upgrades**: User upgrades their personal plan

### `single` Mode
- **Billing Unit**: Organization (workspace)
- **Stripe Customer**: Organization
- **Subscription**: Tied to organization
- **Limits**: Applied per organization
- **Upgrades**: User upgrades their workspace plan

### `multi` Mode
- **Billing Unit**: Organization
- **Stripe Customer**: Organization
- **Subscription**: Tied to organization
- **Limits**: Applied per organization with seat counts
- **Upgrades**: Organization admins manage billing

## 🔐 Security & Permissions

### RLS Policy Complexity

| Mode | Policy Count | Complexity | Performance Impact |
|------|--------------|------------|-------------------|
| `none` | ~10 policies | Simple user checks | Minimal |
| `single` | ~20 policies | Organization membership | Low |
| `multi` | ~25 policies | Role-based checks | Moderate |

### Access Control Examples

#### `none` Mode
```sql
-- Simple user ownership check
CREATE POLICY "Users own their projects"
  ON projects FOR ALL
  USING (auth.uid() = user_id);
```

#### `single` Mode
```sql
-- Organization membership check
CREATE POLICY "Members access organization projects"
  ON projects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
    )
  );
```

#### `multi` Mode
```sql
-- Role-based access check
CREATE POLICY "Admins can delete projects"
  ON projects FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM organization_members
      WHERE organization_id = projects.organization_id
      AND user_id = auth.uid()
      AND role IN ('owner', 'admin')
    )
  );
```

## 🚀 Migration Paths

### Upgrade Path: `none` → `single` → `multi`

| From | To | Difficulty | Data Migration Required | Downtime |
|------|----|------------|------------------------|----------|
| `none` | `single` | 🟡 Moderate | Yes - Create orgs for users | Minimal |
| `none` | `multi` | 🔴 Complex | Yes - Full restructure | Yes |
| `single` | `multi` | 🟢 Easy | No - Already has orgs | None |

### Downgrade Considerations

⚠️ **Warning**: Downgrading is complex and may result in data loss

| From | To | Feasible | Data Loss Risk |
|------|----|----------|----------------|
| `single` | `none` | ⚠️ Difficult | High - Lose org data |
| `multi` | `single` | ⚠️ Very Difficult | High - Multiple orgs → 1 |
| `multi` | `none` | ❌ Not Recommended | Very High |

## 🏗️ Implementation Effort

### Development Time Estimates

| Component | `none` | `single` | `multi` |
|-----------|--------|----------|---------|
| **Initial Setup** | 1 day | 2 days | 3-4 days |
| **Auth Integration** | 2 hours | 4 hours | 1 day |
| **Billing Integration** | 1 day | 1.5 days | 2-3 days |
| **Admin Panel** | 2 days | 3 days | 5 days |
| **User Management** | N/A | 1 day | 3 days |
| **Testing** | 2 days | 3 days | 5 days |
| **Total Estimate** | ~6 days | ~10 days | ~20 days |

## 📝 Configuration Examples

### Environment Variables

```bash
# Mode: none
NEXT_PUBLIC_ORGANIZATION_MODE=none
NEXT_PUBLIC_APP_NAME="My Personal Tool"

# Mode: single (Recommended default)
NEXT_PUBLIC_ORGANIZATION_MODE=single
NEXT_PUBLIC_APP_NAME="My SaaS"
NEXT_PUBLIC_DEFAULT_ORG_NAME="workspace"

# Mode: multi
NEXT_PUBLIC_ORGANIZATION_MODE=multi
NEXT_PUBLIC_APP_NAME="Enterprise Platform"
NEXT_PUBLIC_ENABLE_ORG_INVITES=true
NEXT_PUBLIC_ENABLE_CUSTOM_DOMAINS=true
```

### Code Examples

#### Fetching Projects

```typescript
// Mode: none
const projects = await supabase
  .from('projects')
  .select('*')
  .eq('user_id', user.id);

// Mode: single/multi
const projects = await supabase
  .from('projects')
  .select('*')
  .eq('organization_id', currentOrg.id);
```

#### Creating Subscriptions

```typescript
// Mode: none
const subscription = {
  user_id: user.id,
  plan_id: selectedPlan.id,
  // ...
};

// Mode: single/multi
const subscription = {
  organization_id: currentOrg.id,
  plan_id: selectedPlan.id,
  // ...
};
```

## 🎓 Best Practices

### 1. Start Simple, Plan for Growth
- Begin with `single` mode unless you're certain you only need `none`
- Structure your code to make future migrations easier
- Use abstraction layers for organization-related logic

### 2. Consider Your Users
- Personal tools → `none`
- Small businesses → `single`
- Enterprises → `multi`

### 3. Performance Considerations
- `none`: Fastest queries, simplest indexes
- `single`: Slightly more complex queries
- `multi`: Most complex queries, need careful index planning

### 4. Testing Strategy
- `none`: Test user isolation
- `single`: Test organization creation and access
- `multi`: Test multi-org scenarios, role permissions

## 🔮 Future Considerations

### Potential Features by Mode

| Feature | `none` | `single` | `multi` |
|---------|--------|----------|---------|
| **Public Profiles** | ✅ Easy | 🟡 Moderate | 🔴 Complex |
| **Collaboration** | ❌ Not suitable | ✅ Within org | ✅ Cross-org |
| **API Access** | ✅ User tokens | ✅ Org tokens | ✅ Org + scope |
| **Audit Logs** | 🟡 Basic | ✅ Org-level | ✅ Advanced |
| **SSO/SAML** | ❌ Not applicable | ⚠️ Possible | ✅ Natural fit |
| **White-labeling** | ❌ Not applicable | 🟡 Limited | ✅ Per org |

## 📚 Summary

- **`none`**: Simplest, for personal tools, user-centric
- **`single`**: Balanced, for small teams, one workspace per user
- **`multi`**: Most flexible, for B2B SaaS, multiple organizations

**Recommendation**: Unless building a strictly personal tool, start with `single` mode for the best balance of simplicity and future flexibility.