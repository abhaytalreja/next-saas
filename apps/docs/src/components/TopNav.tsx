import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';

// Define all searchable pages
const searchablePages = [
  // Quick Start
  { title: 'Overview', href: '/', category: 'Quick Start', keywords: ['home', 'start', 'introduction'] },
  { title: 'Setup Methods', href: '/setup-methods', category: 'Quick Start', keywords: ['clone', 'fork', 'template'] },
  { title: '5-Minute Setup', href: '/quickstart', category: 'Quick Start', keywords: ['quick', 'fast', 'install'] },
  { title: 'Project Structure', href: '/project-structure', category: 'Quick Start', keywords: ['structure', 'folders', 'monorepo'] },
  
  // Features
  { title: 'Business Logic', href: '/features/business-logic', category: 'Features', keywords: ['logic', 'rules', 'workflow'] },
  { title: 'Pricing Sync', href: '/features/pricing-sync', category: 'Features', keywords: ['pricing', 'plans', 'billing'] },
  { title: 'Authentication', href: '/features/authentication', category: 'Features', keywords: ['auth', 'login', 'signup'] },
  { title: 'Database', href: '/features/database', category: 'Features', keywords: ['database', 'supabase', 'postgres'] },
  { title: 'UI Components', href: '/features/ui-components', category: 'Features', keywords: ['ui', 'components', 'design'] },
  
  // Architecture
  { title: 'Organization Modes', href: '/architecture/organization-modes', category: 'Architecture', keywords: ['organization', 'modes', 'multi-tenant'] },
  { title: 'Database Schema', href: '/architecture/database-schema', category: 'Architecture', keywords: ['schema', 'tables', 'rls'] },
  
  // Troubleshooting
  { title: 'Troubleshooting Overview', href: '/troubleshooting', category: 'Troubleshooting', keywords: ['troubleshoot', 'issues', 'problems', 'help'] },
  { title: 'Environment Variables', href: '/troubleshooting/environment-variables', category: 'Troubleshooting', keywords: ['env', 'environment', 'variables', 'turborepo'] },
  { title: 'Database Errors', href: '/troubleshooting/database-errors', category: 'Troubleshooting', keywords: ['database', 'errors', 'migration'] },
  { title: 'Build Errors', href: '/troubleshooting/build-errors', category: 'Troubleshooting', keywords: ['build', 'compile', 'typescript'] },
  { title: 'Port Conflicts', href: '/troubleshooting/port-conflicts', category: 'Troubleshooting', keywords: ['port', 'conflict', '3000'] },
  { title: 'Authentication Issues', href: '/troubleshooting/authentication', category: 'Troubleshooting', keywords: ['auth', 'login', 'session'] },
  { title: 'Deployment Issues', href: '/troubleshooting/deployment', category: 'Troubleshooting', keywords: ['deploy', 'vercel', 'production'] },
];

export default function TopNav() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<typeof searchablePages>([]);
  const [showSearch, setShowSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Handle search
  useEffect(() => {
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const results = searchablePages.filter(page => 
        page.title.toLowerCase().includes(query) ||
        page.category.toLowerCase().includes(query) ||
        page.keywords.some(keyword => keyword.includes(query))
      );
      setSearchResults(results);
      setShowSearch(true);
    } else {
      setSearchResults([]);
      setShowSearch(false);
    }
  }, [searchQuery]);

  // Close search on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle search result click
  const handleResultClick = (href: string) => {
    router.push(href);
    setSearchQuery('');
    setShowSearch(false);
  };

  // Keyboard shortcut for search (Cmd/Ctrl + K)
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
      <div className="flex items-center justify-between h-16 px-4 max-w-7xl mx-auto">
        {/* Logo/Home */}
        <div className="flex items-center">
          <a href="/" className="font-bold text-xl text-gray-900 hover:text-gray-700">
            NextSaaS Docs
          </a>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-8" ref={searchRef}>
          <div className="relative">
            <input
              id="search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search docs... (⌘K)"
              className="w-full px-4 py-2 pl-10 pr-4 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            
            {/* Search Results Dropdown */}
            {showSearch && searchResults.length > 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                {searchResults.map((result, index) => (
                  <button
                    key={index}
                    onClick={() => handleResultClick(result.href)}
                    className="w-full px-4 py-3 text-left hover:bg-gray-50 focus:bg-gray-50 focus:outline-none border-b border-gray-100 last:border-0"
                  >
                    <div className="font-medium text-gray-900">{result.title}</div>
                    <div className="text-xs text-gray-500">{result.category}</div>
                  </button>
                ))}
              </div>
            )}
            
            {/* No Results */}
            {showSearch && searchQuery && searchResults.length === 0 && (
              <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                <p className="text-sm text-gray-500">No results found for "{searchQuery}"</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="flex items-center space-x-6">
          <a
            href="/troubleshooting"
            className="text-sm font-medium text-gray-700 hover:text-blue-600 flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Troubleshooting
          </a>
          <a
            href="/quickstart"
            className="text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
          >
            Quick Start →
          </a>
        </div>
      </div>
    </div>
  );
}