# Page snapshot

```yaml
- alert
- button "Open Next.js Dev Tools":
  - img
- button "Open issues overlay": 1 Issue
- navigation:
  - button "previous" [disabled]:
    - img "previous"
  - text: 1/1
  - button "next" [disabled]:
    - img "next"
- img
- img
- text: Next.js 15.3.5 Webpack
- img
- dialog "Build Error":
  - text: Build Error
  - button "Copy Stack Trace":
    - img
  - button "No related documentation found" [disabled]:
    - img
  - link "Learn more about enabling Node.js inspector for server code with Chrome DevTools":
    - /url: https://nextjs.org/docs/app/building-your-application/configuring/debugging#server-side-code
    - img
  - paragraph: "Error: × Unexpected token `div`. Expected jsx identifier"
  - img
  - text: ./src/app/settings/profile/page.tsx
  - button "Open in editor":
    - img
  - text: "Error: × Unexpected token `div`. Expected jsx identifier ╭─[/Users/abhay/Documents/workspace/next-js/next-saas/apps/web/src/app/settings/profile/page.tsx:18:1] 15 │ const { user } = useAuth() 16 │ 17 │ return ( 18 │ <div className=\"px-6 py-6 sm:px-8 sm:py-8\" data-testid=\"profile-settings-page\"> · ─── 19 │ {/* Page Header */} 20 │ <header className=\"border-b border-gray-200 pb-6\" data-testid=\"page-header\"> 21 │ <h1 className=\"text-2xl font-semibold text-gray-900\"> ╰──── Caused by: Syntax Error"
- contentinfo:
  - paragraph: This error occurred during the build process and can only be dismissed by fixing the error.
```