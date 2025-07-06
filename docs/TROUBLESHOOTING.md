# 🔧 Troubleshooting Guide

This guide covers common issues and their solutions when working with NextSaaS.

## 🚨 Most Common Issues

### 1. Environment Variables Not Loading in Turborepo

**Error**: `Invalid Supabase configuration: [{"code":"invalid_type","expected":"string","received":"undefined"...}]`

**Solution**: Add your environment variables to `turbo.json`:

```json
{
  "globalEnv": [
    "NODE_ENV",
    "NEXT_PUBLIC_SUPABASE_URL",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "NEXT_PUBLIC_ORGANIZATION_MODE",
    // Add any other env vars your apps need
  ]
}
```

Then restart your dev server from the root directory.

### 2. Database Migration Errors

**Error**: `ERROR: 42P07: relation "idx_projects_organization_id" already exists`

**Solution**: The latest version handles existing objects gracefully. Run:
```bash
npm run db:generate-sql -- --mode [your-mode]
```

### 3. Features Column Type Mismatch

**Error**: `column "features" is of type jsonb but expression is of type text[]`

**Solution**: This has been fixed. The `features` column now uses `jsonb` type consistently.

## 📚 Full Troubleshooting Documentation

For detailed troubleshooting guides, visit the documentation site:

1. Start the docs server: `npm run dev`
2. Visit: http://localhost:3001/troubleshooting

The documentation includes detailed guides for:
- Environment Variables issues
- Database Connection problems
- Build & Compilation errors
- Port Conflicts
- Authentication issues
- Deployment problems

## 🆘 Getting Help

1. **Check existing issues**: [GitHub Issues](https://github.com/abhaytalreja/next-saas/issues)
2. **Ask the community**: [Discord Server](https://discord.gg/yourdiscord)
3. **Create a new issue**: Include:
   - Steps to reproduce
   - Error messages
   - Your environment (OS, Node version)
   - Relevant configuration files

## 🤝 Contributing

Found a solution to a common problem? Please contribute it back:
1. Add it to this guide
2. Update the documentation site
3. Submit a PR

Your contributions help the entire community!