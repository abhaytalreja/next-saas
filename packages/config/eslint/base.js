const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/** @type {import("eslint").Linter.Config} */
module.exports = {
  extends: [
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier",
    "turbo",
  ],
  plugins: ["only-warn", "@typescript-eslint", "react", "react-hooks", "jsx-a11y", "import"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    project,
    tsconfigRootDir: process.cwd(),
  },
  globals: {
    React: true,
    JSX: true,
  },
  env: {
    browser: true,
    node: true,
    es6: true,
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  rules: {
    // NextSaaS Quality Rules
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/prefer-nullish-coalescing": "error",
    "@typescript-eslint/prefer-optional-chain": "error",
    "@typescript-eslint/no-non-null-assertion": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    "@typescript-eslint/no-unnecessary-type-assertion": "error",
    
    // Import Rules
    "import/order": ["error", {
      "groups": [
        "builtin",
        "external", 
        "internal",
        "parent",
        "sibling",
        "index"
      ],
      "newlines-between": "always",
      "alphabetize": { "order": "asc" }
    }],
    "import/no-default-export": "error",
    "import/no-duplicates": "error",
    
    // React Rules
    "react/prop-types": "off", // Using TypeScript instead
    "react/react-in-jsx-scope": "off", // Next.js handles this
    "react/jsx-sort-props": ["error", { 
      "callbacksLast": true,
      "shorthandFirst": true,
      "reservedFirst": true
    }],
    "react/self-closing-comp": "error",
    "react/jsx-boolean-value": ["error", "never"],
    
    // React Hooks Rules
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "error",
    
    // Accessibility Rules
    "jsx-a11y/anchor-is-valid": "error",
    "jsx-a11y/alt-text": "error",
    "jsx-a11y/aria-props": "error",
    "jsx-a11y/click-events-have-key-events": "error",
    
    // Performance Rules
    "react/jsx-no-bind": "error",
    "react/jsx-no-leaked-render": "error",
    
    // Security Rules
    "react/no-danger": "error",
    "react/no-danger-with-children": "error",
    
    // Code Quality
    "prefer-const": "error",
    "no-var": "error",
    "no-console": "warn",
    "no-debugger": "error",
  },
  ignorePatterns: [
    // Ignore dotfiles
    ".*.js",
    "node_modules/",
    "dist/",
    ".next/",
    "out/",
  ],
  overrides: [
    {
      files: ["*.js?(x)", "*.ts?(x)"],
    },
    {
      files: ["**/pages/**", "**/app/**", "**/*.stories.*", "**/next.config.*"],
      rules: {
        "import/no-default-export": "off", // Allow default exports for pages and config files
      },
    },
    {
      files: ["**/*.test.*", "**/*.spec.*"],
      rules: {
        "@typescript-eslint/no-explicit-any": "off", // Allow any in tests
        "react/jsx-no-bind": "off", // Allow bind in tests
      },
    },
  ],
};