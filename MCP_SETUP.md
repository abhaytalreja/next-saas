# Supabase MCP (Model Context Protocol) Setup Guide

This guide explains how to set up the Supabase MCP server to connect your AI assistants (Cursor, Claude, etc.) to your Supabase database.

## What is MCP?

Model Context Protocol (MCP) standardizes how Large Language Models (LLMs) talk to external services like Supabase. Once connected, your AI assistants can interact with and query your Supabase projects on your behalf.

## Prerequisites

1. **Supabase Personal Access Token**: 
   - Go to [Supabase Settings](https://supabase.com/dashboard/account/tokens)
   - Click "Generate new token"
   - Give it a descriptive name like "MCP Server"
   - Copy the token - you'll need it for configuration

## Configuration Files

Two configuration options are provided:

### Option 1: Official Supabase MCP Server (Recommended)

**File**: `.mcp.json`

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=rfakvkihqdhfueclbkhm"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "YOUR_PERSONAL_ACCESS_TOKEN_HERE"
      }
    }
  }
}
```

**Setup Steps**:
1. Replace `YOUR_PERSONAL_ACCESS_TOKEN_HERE` with your Supabase personal access token
2. Your project reference is already configured: `rfakvkihqdhfueclbkhm`

### Option 2: PostgREST-based MCP Server

**File**: `.mcp-postgrest.json`

This option uses your existing anon key and doesn't require a personal access token. It's already configured with your project details.

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-postgrest",
        "--apiUrl",
        "https://rfakvkihqdhfueclbkhm.supabase.co/rest/v1",
        "--apiKey",
        "YOUR_ANON_KEY",
        "--schema",
        "public"
      ]
    }
  }
}
```

## AI Tool Integration

### For Cursor IDE
1. Copy `.mcp.json` to `.cursor/mcp.json` in your project root
2. Restart Cursor
3. The MCP server will be available for AI interactions

### For VS Code with Copilot
1. Copy the configuration to `.vscode/mcp.json`
2. Restart VS Code

### For Claude Desktop
1. Use the main `.mcp.json` configuration
2. Follow Claude's MCP setup instructions

## Security Notes

⚠️ **Important Security Considerations**:

1. **Read-only by default**: The configuration uses `--read-only` flag to prevent accidental data modifications
2. **Project-scoped**: Limited to your specific project (`rfakvkihqdhfueclbkhm`)
3. **Development use**: Recommended for development/staging, not production databases
4. **Token security**: Personal access tokens are sensitive - keep them secure

## Available Features

Once configured, the MCP server provides 20+ tools including:
- Database schema inspection
- Table data querying
- Storage bucket management
- Authentication user management
- Real-time subscription management
- Edge function management

## Troubleshooting

### Common Issues:

1. **Permission denied**: Ensure your personal access token has the correct permissions
2. **Connection failed**: Verify your project reference is correct
3. **Windows users**: Prefix commands with `cmd /c` if needed

### Testing the Connection:

You can test if MCP is working by asking your AI assistant:
- "Show me the database schema"
- "What tables exist in this Supabase project?"
- "List the users in the auth.users table"

## Configuration Management

- The `.mcp.json` file is added to `.gitignore` to prevent committing sensitive tokens
- Use environment variables or secure token management in production
- Consider using the PostgREST option for simpler setup without personal tokens

## Next Steps

1. Create your Supabase personal access token
2. Update the `.mcp.json` file with your token
3. Copy the configuration to your AI tool's config directory
4. Restart your AI tool
5. Test the integration by asking database-related questions

The MCP integration will significantly enhance your AI assistant's ability to help with database operations, schema management, and data analysis tasks.