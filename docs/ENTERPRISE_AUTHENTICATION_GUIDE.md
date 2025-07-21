# Complete Guide: Setting Up Enterprise SSO for Your SaaS

This guide will walk you through setting up Single Sign-On (SSO) and security features for your NextSaaS application. No prior SSO experience required!

## What You'll Learn

By the end of this guide, you'll have:
- ✅ Working SSO with your company's login system (Okta, Google, Microsoft, etc.)
- ✅ Security policies that protect your organization
- ✅ Audit logs for compliance and monitoring
- ✅ A complete understanding of how enterprise authentication works

## What is SSO and Why Do You Need It?

**Single Sign-On (SSO)** lets your users log into your app using their company credentials instead of creating separate accounts. Think of it like "Sign in with Google" but for businesses.

**Why enterprises want SSO:**
- Employees don't need to remember another password
- IT admins can control who has access from one place
- Better security through centralized management
- Required for most enterprise sales

## Before You Start

**You'll need:**
- Admin access to your identity provider (Okta, Google Workspace, Azure AD, etc.)
- Admin access to your NextSaaS application
- About 30 minutes to complete the setup

## Step-by-Step Setup

### Step 1: Prepare Your Database

First, we need to add the necessary database tables:

```bash
# Run this in your project terminal
npx supabase migration up
```

**What this does:** Creates tables to store SSO configurations, security policies, and audit logs.

### Step 2: Add SSO to Your App

Add the SSO components to your organization settings page:

```tsx
// In your app/dashboard/organization/security/page.tsx (or similar)
import { SSOConfigForm, SecurityPolicyManager } from '@nextsaas/enterprise-auth'

export default function OrganizationSecurityPage() {
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Organization Security</h1>
      
      {/* SSO Configuration Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Single Sign-On (SSO)</h2>
        <SSOConfigForm onSave={handleSSOSave} />
      </div>
      
      {/* Security Policies Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Security Policies</h2>
        <SecurityPolicyManager 
          policies={securityPolicies}
          onSave={handlePolicySave}
          onDelete={handlePolicyDelete}
        />
      </div>
    </div>
  )
}
```

### Step 3: Configure Your Identity Provider

Now you need to set up your company's login system to work with your app. Don't worry - we'll walk through each major provider:

#### Option A: Setting Up with Okta

**If your company uses Okta:**

1. **Log into Okta Admin Dashboard**
   - Go to your Okta admin portal (usually `yourcompany-admin.okta.com`)
   - You'll need admin privileges

2. **Create a New App**
   - Click "Applications" → "Create App Integration"
   - Choose "SAML 2.0"
   - Click "Next"

3. **Basic Settings**
   - App name: "YourApp SSO" (use your actual app name)
   - Click "Next"

4. **Configure SAML Settings**
   - **Single sign-on URL**: `https://yourdomain.com/api/auth/saml/callback`
   - **Audience URI**: `https://yourdomain.com`
   - **Default RelayState**: Leave blank
   - **Name ID format**: EmailAddress
   - **Application username**: Email

5. **Attribute Statements** (Important!)
   ```
   Name: email        Value: user.email
   Name: firstName    Value: user.firstName  
   Name: lastName     Value: user.lastName
   Name: displayName  Value: user.displayName
   ```

6. **Download Metadata**
   - After saving, go to "Sign On" tab
   - Click "View Setup Instructions"
   - Copy the metadata XML (we'll need this in Step 4)

#### Option B: Setting Up with Google Workspace

**If your company uses Google Workspace:**

1. **Go to Google Admin Console**
   - Visit `admin.google.com`
   - Navigate to "Apps" → "Web and mobile apps"

2. **Add Custom SAML App**
   - Click "Add app" → "Add custom SAML app"
   - Enter app name: "YourApp SSO"

3. **Download Google Metadata**
   - Download the metadata file (save this for Step 4)
   - Click "Continue"

4. **Configure Service Provider Details**
   - **ACS URL**: `https://yourdomain.com/api/auth/saml/callback`
   - **Entity ID**: `https://yourdomain.com`
   - **Start URL**: `https://yourdomain.com/auth/sso`
   - Click "Continue"

5. **Attribute Mapping**
   ```
   email → Basic Information → Primary email
   firstName → Basic Information → First name
   lastName → Basic Information → Last name
   ```

#### Option C: Setting Up with Microsoft Azure AD

**If your company uses Microsoft 365/Azure AD:**

1. **Go to Azure Portal**
   - Visit `portal.azure.com`
   - Navigate to "Azure Active Directory" → "Enterprise applications"

2. **Create New Application**
   - Click "New application" → "Create your own application"
   - Name: "YourApp SSO"
   - Select "Integrate any other application"

3. **Set Up Single Sign-On**
   - Go to "Single sign-on" → "SAML"
   - Click "Edit" in Basic SAML Configuration

4. **Basic SAML Configuration**
   - **Identifier (Entity ID)**: `https://yourdomain.com`
   - **Reply URL**: `https://yourdomain.com/api/auth/saml/callback`
   - **Sign on URL**: `https://yourdomain.com/auth/sso`

5. **Download Metadata**
   - In the "SAML Signing Certificate" section
   - Download "Federation Metadata XML"

### Step 4: Connect Your Identity Provider to NextSaaS

Now we'll configure your NextSaaS app to work with the identity provider you just set up:

1. **Go to Your App's Security Settings**
   - Navigate to your organization settings
   - Find the "Single Sign-On" section

2. **Upload Your Metadata**
   - Use the metadata XML file you downloaded in Step 3
   - Either upload the file or copy-paste the XML content

3. **Test the Connection**
   - Click "Test Configuration" 
   - This checks if everything is set up correctly
   - Fix any errors before proceeding

4. **Activate SSO**
   - Once testing passes, toggle "Active" to enable SSO
   - Your users can now log in with SSO!

### How SSO Login Works (For Your Understanding)

Here's what happens when a user clicks "Sign in with SSO":

1. **User clicks SSO login** → Your app redirects them to your company's login page
2. **User enters company credentials** → They log in with their usual work username/password  
3. **Company system confirms identity** → Sends encrypted confirmation back to your app
4. **Your app creates user session** → User is now logged into your app automatically
5. **Done!** → User sees your app dashboard, no separate password needed

This whole process takes just a few seconds and is completely seamless for users.

## Adding Security Policies (Optional but Recommended)

Security policies add extra protection for your organization. Think of them as rules that automatically enforce security best practices.

### What Are Security Policies?

Security policies are automatic rules that:
- **Protect your data** by controlling who can access it and how
- **Meet compliance requirements** that enterprises often have
- **Prevent security incidents** before they happen
- **Give you audit trails** for when something goes wrong

### Common Security Policies You Can Set Up

#### 1. IP Whitelisting (Allow Only Specific Locations)

**What it does:** Only allows users to log in from specific locations (like your office or VPN).

**When to use it:** If your team only works from specific locations and you want maximum security.

**How to set it up:**
1. Go to Security Policies in your org settings
2. Click "Add Policy" → "IP Whitelist"
3. Add your allowed locations:
   ```
   Office WiFi: 192.168.1.0/24
   VPN Server: 203.0.113.1
   Home Office: 198.51.100.50
   ```
4. Optionally restrict by country (e.g., only allow US and Canada)
5. Save and activate

**⚠️ Important:** Test this carefully! You can accidentally lock yourself out if you get the IP addresses wrong.

#### 2. Multi-Factor Authentication (MFA) Requirement

**What it does:** Requires users to use a second form of authentication (like Google Authenticator) in addition to their password.

**When to use it:** Always! This is one of the best security measures you can implement.

**How to set it up:**
1. Go to Security Policies → "Add Policy" → "MFA Enforcement"
2. Choose which MFA methods to allow:
   - **Google Authenticator/Authy** (recommended - most secure)
   - **SMS codes** (convenient but less secure)
   - **Email codes** (backup option)
   - **Hardware keys** (like YubiKey - most secure but requires special devices)
3. Set a grace period (e.g., 24 hours for new users to set up MFA)
4. Save and activate

#### 3. Session Timeouts (Automatic Logout)

**What it does:** Automatically logs users out after a period of inactivity or after a maximum time.

**When to use it:** Great for shared computers or high-security environments.

**How to set it up:**
1. Go to Security Policies → "Add Policy" → "Session Timeout"
2. Set your timeouts:
   - **Idle timeout**: Log out after 30 minutes of no activity
   - **Maximum session**: Log out after 8 hours no matter what
   - **Concurrent sessions**: Limit to 3 devices logged in at once
3. Save and activate

#### 4. Strong Password Requirements

**What it does:** Forces users to create strong passwords that meet specific criteria.

**When to use it:** Always good to have, especially if users create passwords directly in your app.

**How to set it up:**
1. Go to Security Policies → "Add Policy" → "Password Policy"
2. Set your requirements:
   - Minimum 12 characters
   - Must include uppercase, lowercase, numbers, and symbols
   - Can't reuse last 10 passwords
   - Must change password every 90 days
3. Save and activate

### Easy Setup Using the UI

Instead of writing code, you can set up all these policies using the built-in interface:

1. **Go to your organization settings**
2. **Click "Security Policies"**
3. **Click "Add New Policy"**
4. **Choose the type of policy you want**
5. **Fill out the simple form**
6. **Test the policy** (important!)
7. **Activate when ready**

The interface will guide you through each step and explain what each setting does.

## Monitoring and Troubleshooting

### Security Event Logs

Your system automatically tracks security events so you can see what's happening and troubleshoot issues.

**What gets logged:**
- Login attempts (successful and failed)
- MFA challenges
- IP blocks
- Policy violations
- Suspicious activity

**How to view logs:**
1. Go to your organization settings
2. Click "Security Events" 
3. Filter by type, user, or date range
4. Export for compliance if needed

### Common Issues and Solutions

#### "SSO Login Not Working"

**Problem:** Users get errors when trying to log in with SSO.

**Quick fixes to try:**
1. **Check if SSO is active** - Make sure you toggled it on in settings
2. **Test the configuration** - Use the "Test Configuration" button
3. **Check metadata** - Make sure the XML from your identity provider is current
4. **Verify URLs** - Double-check the callback URL in your identity provider matches exactly

#### "Users Can't Access from Expected Locations"

**Problem:** IP whitelist is blocking legitimate users.

**Quick fixes:**
1. **Check IP format** - Use CIDR notation: `192.168.1.0/24` not `192.168.1.*`
2. **Account for proxies** - Your office might use different external IPs
3. **Test with single IP first** - Get your current IP from `whatismyip.com` and try that
4. **Temporarily disable** - Turn off IP whitelist while debugging

#### "MFA Setup Problems"

**Problem:** Users having trouble setting up multi-factor authentication.

**Quick fixes:**
1. **Check grace period** - Make sure users have enough time to set up MFA
2. **Provide instructions** - Send users clear steps for their MFA app
3. **Allow backup methods** - Enable SMS or email as backup options
4. **Test the QR code** - Make sure the setup QR code is working

### Getting Help

If you're still stuck:

1. **Check the detailed API reference** - See the [API Reference Guide](./ENTERPRISE_AUTH_API_REFERENCE.md) for technical details
2. **Look at debug logs** - Enable debug mode in your middleware for detailed logging
3. **Test in isolation** - Try SSO with just one user first
4. **Export security events** - Use the event logs to see exactly what's failing

### Testing Your Setup

Before going live, test everything:

**SSO Testing Checklist:**
- [ ] Test login with a sample user
- [ ] Verify user data maps correctly (name, email)
- [ ] Test logout process
- [ ] Try login from different browsers
- [ ] Test what happens when SSO is unavailable

**Security Policy Testing:**
- [ ] Test each policy with a safe test user
- [ ] Verify policies don't lock out admins
- [ ] Check that audit logs are working
- [ ] Test policy combinations don't conflict

**Ready for Production:**
- [ ] All tests pass
- [ ] Backup admin access method configured
- [ ] Team trained on new login process
- [ ] Support documentation updated

## What's Next?

Congratulations! You now have enterprise-grade authentication set up. Here are some next steps:

### For Sales Teams

**Use this to close enterprise deals:**
- ✅ "Yes, we support SSO with your existing login system"
- ✅ "Yes, we have IP whitelisting and security policies"
- ✅ "Yes, we provide comprehensive audit logs for compliance"
- ✅ "Yes, we can enforce MFA for your organization"

### For Development Teams

**Consider these advanced features next:**
- **Usage-based billing** - Track and bill based on actual usage
- **API management** - Rate limiting and API keys for enterprise customers
- **Multi-region support** - Data residency for global enterprises
- **Advanced analytics** - Detailed usage and security reporting

### For Compliance and Security

**Your system now provides:**
- SAML 2.0 SSO integration
- Advanced security policies
- Comprehensive audit logging
- Real-time threat detection
- Industry-standard security practices

## Quick Reference

### Key URLs to Remember
- SSO callback: `https://yourdomain.com/api/auth/saml/callback`
- Entity ID: `https://yourdomain.com`
- Login URL: `https://yourdomain.com/auth/sso`

### Important Settings Locations
- Organization Security: `/dashboard/organization/security`
- Security Events: `/dashboard/organization/security/events`
- User Management: `/dashboard/organization/members`

### Need Help?

- **Technical details**: Check the [API Reference](./ENTERPRISE_AUTH_API_REFERENCE.md)
- **Code examples**: See the package README at `packages/enterprise-auth/README.md`
- **Troubleshooting**: Review the common issues section above

---

**🎉 You're now ready to win enterprise customers with production-ready SSO and security features!**