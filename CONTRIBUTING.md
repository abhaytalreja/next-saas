# Contributing to NextSaaS

Thank you for your interest in contributing to NextSaaS! This document outlines the process for contributing to this project and helps you get started.

## 🚀 Getting Started

### Prerequisites

Before you begin contributing, ensure you have:

- Node.js 18+ installed
- npm 10.9.2+ installed
- Git installed and configured
- A GitHub account

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/next-saas.git
   cd next-saas
   ```

3. **Add the upstream remote**:
   ```bash
   git remote add upstream https://github.com/abhaytalreja/next-saas.git
   ```

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Create a new branch** for your changes:
   ```bash
   git checkout -b feature/your-feature-name
   ```

6. **Start the development server**:
   ```bash
   npm run dev
   ```

## 📝 Development Guidelines

### Code Style

We use automated tools to maintain code quality:

- **ESLint** - For code linting
- **Prettier** - For code formatting
- **TypeScript** - For type checking
- **Husky** - For pre-commit hooks

All code must pass these checks before being merged.

### Commit Messages

We follow the [Conventional Commits](https://conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New features
- `fix`: Bug fixes
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```
feat(ui): add new Button component
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
```

### Branch Naming

Use descriptive branch names:
- `feat/feature-name` - For new features
- `fix/bug-description` - For bug fixes
- `docs/documentation-update` - For documentation
- `refactor/component-name` - For refactoring

### Testing

- Write tests for new features and bug fixes
- Ensure all tests pass before submitting a PR
- Maintain or improve test coverage

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## 🔄 Pull Request Process

### Before Creating a PR

1. **Sync with upstream**:
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   ```

2. **Rebase your branch**:
   ```bash
   git checkout feature/your-feature-name
   git rebase main
   ```

3. **Run quality checks**:
   ```bash
   npm run lint
   npm run type-check
   npm run test
   npm run build
   ```

### Creating a PR

1. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

2. **Create a Pull Request** on GitHub with:
   - Clear title and description
   - Reference related issues
   - Screenshots for UI changes
   - Testing instructions

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Related Issues
Closes #(issue number)

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots for UI changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Code is commented where needed
- [ ] Tests added/updated
- [ ] Documentation updated
```

## 🐛 Reporting Issues

### Bug Reports

When reporting bugs, please include:

1. **Clear title** describing the issue
2. **Steps to reproduce** the problem
3. **Expected behavior** vs actual behavior
4. **Environment details** (OS, Node.js version, browser)
5. **Screenshots** if applicable
6. **Error messages** and stack traces

### Feature Requests

For feature requests, please provide:

1. **Clear description** of the feature
2. **Use case** and motivation
3. **Acceptance criteria**
4. **Implementation suggestions** (if any)

## 📁 Project Structure

Understanding the project structure helps with contributions:

```
next-saas/
├── apps/
│   ├── web/          # Main SaaS application
│   ├── docs/         # Documentation site
│   └── landing/      # Marketing landing page
├── packages/
│   ├── ui/           # Shared UI components
│   ├── auth/         # Authentication utilities
│   ├── database/     # Database client and schemas
│   ├── config/       # Shared configurations
│   ├── types/        # Shared TypeScript types
│   └── utils/        # Shared utility functions
├── .github/          # GitHub Actions workflows
├── .husky/           # Git hooks
└── scripts/          # Build and development scripts
```

## 🔧 Development Tips

### Working with Packages

- **Adding dependencies**: Use workspace-specific commands
- **Shared components**: Add to `packages/ui`
- **Utilities**: Add to `packages/utils`
- **Types**: Add to `packages/types`

### Testing Changes

- Test across all apps when making package changes
- Use `npm run dev` to test all apps simultaneously
- Check console for TypeScript errors

### Performance

- Use Turborepo's caching effectively
- Avoid unnecessary re-renders in React components
- Optimize bundle sizes

## 🤝 Code of Conduct

### Our Pledge

We pledge to make participation in our project a harassment-free experience for everyone, regardless of age, body size, disability, ethnicity, gender identity and expression, level of experience, nationality, personal appearance, race, religion, or sexual identity and orientation.

### Our Standards

Examples of behavior that contributes to a positive environment:
- Using welcoming and inclusive language
- Being respectful of differing viewpoints and experiences
- Gracefully accepting constructive criticism
- Focusing on what is best for the community
- Showing empathy towards other community members

### Enforcement

Instances of abusive, harassing, or otherwise unacceptable behavior may be reported by contacting the project team. All complaints will be reviewed and investigated promptly and fairly.

## 📞 Getting Help

If you need help with development:

1. **Check existing issues** and discussions
2. **Read the documentation** thoroughly
3. **Ask questions** in GitHub Discussions
4. **Join our community** for real-time help

## 🎉 Recognition

Contributors are recognized in several ways:

- Listed in the project's contributors
- Mentioned in release notes for significant contributions
- Invited to join the core team for consistent valuable contributions

## 📄 License

By contributing to NextSaaS, you agree that your contributions will be licensed under the same MIT License that covers the project.

---

Thank you for contributing to NextSaaS! Your efforts help make this project better for everyone. 🚀