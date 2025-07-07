import { AuthLayout, Button, Input, Checkbox } from '@nextsaas/ui'
import { ComponentLayout } from '../../components/ComponentLayout'
import { Mail, Lock, Eye, EyeOff, Github, Google } from 'lucide-react'
import { useState } from 'react'

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input
          type="email"
          placeholder="Enter your email"
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            className="w-full pr-10"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox id="remember" />
          <label htmlFor="remember" className="text-sm">Remember me</label>
        </div>
        <a href="#" className="text-sm text-primary hover:underline">
          Forgot password?
        </a>
      </div>
      
      <Button className="w-full">
        Sign In
      </Button>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-muted"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <Button variant="outline" className="w-full">
          <Github className="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button variant="outline" className="w-full">
          <Google className="mr-2 h-4 w-4" />
          Google
        </Button>
      </div>
    </div>
  )
}

const SignUpForm = () => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">First Name</label>
          <Input placeholder="John" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Last Name</label>
          <Input placeholder="Doe" />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input type="email" placeholder="john@example.com" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Password</label>
        <Input type="password" placeholder="Create a password" />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Confirm Password</label>
        <Input type="password" placeholder="Confirm your password" />
      </div>
      
      <div className="flex items-center space-x-2">
        <Checkbox id="terms" />
        <label htmlFor="terms" className="text-sm">
          I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{' '}
          <a href="#" className="text-primary hover:underline">Privacy Policy</a>
        </label>
      </div>
      
      <Button className="w-full">
        Create Account
      </Button>
    </div>
  )
}

const ForgotPasswordForm = () => {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <p className="text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">Email</label>
        <Input type="email" placeholder="Enter your email" />
      </div>
      
      <Button className="w-full">
        Send Reset Link
      </Button>
      
      <div className="text-center">
        <a href="#" className="text-sm text-primary hover:underline">
          Back to sign in
        </a>
      </div>
    </div>
  )
}

const BasicExample = () => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <AuthLayout
        title="Welcome back"
        subtitle="Sign in to your account to continue"
        footerText="Don't have an account?"
        footerLinkText="Sign up"
        footerLinkHref="/signup"
      >
        <LoginForm />
      </AuthLayout>
    </div>
  )
}

const SignUpExample = () => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <AuthLayout
        title="Create your account"
        subtitle="Get started with your free account today"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
        variant="signup"
      >
        <SignUpForm />
      </AuthLayout>
    </div>
  )
}

const ForgotPasswordExample = () => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <AuthLayout
        title="Reset your password"
        subtitle="We'll send you a link to reset your password"
        footerText="Remember your password?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
        variant="forgot-password"
      >
        <ForgotPasswordForm />
      </AuthLayout>
    </div>
  )
}

const WithBackgroundExample = () => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <AuthLayout
        title="Welcome to NextSaaS"
        subtitle="Sign in to access your dashboard"
        footerText="New to our platform?"
        footerLinkText="Create account"
        footerLinkHref="/signup"
        backgroundImage="https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&auto=format&fit=crop&w=2074&q=80"
        logo={{
          src: '/api/placeholder/120/40',
          alt: 'NextSaaS',
        }}
      >
        <LoginForm />
      </AuthLayout>
    </div>
  )
}

const SplitLayoutExample = () => {
  return (
    <div className="h-[600px] border rounded-lg overflow-hidden">
      <AuthLayout
        title="Join thousands of users"
        subtitle="Start your journey with us today"
        footerText="Already have an account?"
        footerLinkText="Sign in"
        footerLinkHref="/login"
        layout="split"
        sideContent={{
          title: "Build better products faster",
          description: "Our platform helps teams create amazing user experiences with powerful tools and integrations.",
          features: [
            "Advanced analytics and reporting",
            "Real-time collaboration tools", 
            "Enterprise-grade security",
            "24/7 customer support"
          ],
          testimonial: {
            quote: "This platform has transformed how we work. The features are incredible and the support is outstanding.",
            author: "Sarah Johnson",
            role: "Product Manager, TechCorp",
            avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face"
          }
        }}
      >
        <SignUpForm />
      </AuthLayout>
    </div>
  )
}

const examples = [
  {
    title: 'Login Layout',
    code: `<AuthLayout
  title="Welcome back"
  subtitle="Sign in to your account to continue"
  footerText="Don't have an account?"
  footerLinkText="Sign up"
  footerLinkHref="/signup"
>
  <form className="space-y-4">
    <div>
      <label className="block text-sm font-medium mb-2">Email</label>
      <Input type="email" placeholder="Enter your email" />
    </div>
    
    <div>
      <label className="block text-sm font-medium mb-2">Password</label>
      <Input type="password" placeholder="Enter your password" />
    </div>
    
    <Button className="w-full">Sign In</Button>
  </form>
</AuthLayout>`,
    component: <BasicExample />,
  },
  {
    title: 'Sign Up Layout',
    code: `<AuthLayout
  title="Create your account"
  subtitle="Get started with your free account today"
  footerText="Already have an account?"
  footerLinkText="Sign in"
  footerLinkHref="/login"
  variant="signup"
>
  <form className="space-y-4">
    <div className="grid grid-cols-2 gap-3">
      <Input placeholder="First Name" />
      <Input placeholder="Last Name" />
    </div>
    
    <Input type="email" placeholder="Email" />
    <Input type="password" placeholder="Password" />
    
    <Button className="w-full">Create Account</Button>
  </form>
</AuthLayout>`,
    component: <SignUpExample />,
  },
  {
    title: 'Forgot Password',
    code: `<AuthLayout
  title="Reset your password"
  subtitle="We'll send you a link to reset your password"
  footerText="Remember your password?"
  footerLinkText="Sign in"
  footerLinkHref="/login"
  variant="forgot-password"
>
  <form className="space-y-4">
    <Input type="email" placeholder="Enter your email" />
    <Button className="w-full">Send Reset Link</Button>
  </form>
</AuthLayout>`,
    component: <ForgotPasswordExample />,
  },
  {
    title: 'With Background Image',
    code: `<AuthLayout
  title="Welcome to NextSaaS"
  subtitle="Sign in to access your dashboard"
  footerText="New to our platform?"
  footerLinkText="Create account"
  footerLinkHref="/signup"
  backgroundImage="/hero-bg.jpg"
  logo={{
    src: '/logo.png',
    alt: 'NextSaaS',
  }}
>
  {/* Login form */}
</AuthLayout>`,
    component: <WithBackgroundExample />,
  },
  {
    title: 'Split Layout with Features',
    code: `<AuthLayout
  title="Join thousands of users"
  subtitle="Start your journey with us today"
  layout="split"
  sideContent={{
    title: "Build better products faster",
    description: "Our platform helps teams create amazing experiences.",
    features: [
      "Advanced analytics and reporting",
      "Real-time collaboration tools", 
      "Enterprise-grade security",
    ],
    testimonial: {
      quote: "This platform has transformed how we work.",
      author: "Sarah Johnson",
      role: "Product Manager, TechCorp",
      avatar: "/avatar.jpg"
    }
  }}
>
  {/* Sign up form */}
</AuthLayout>`,
    component: <SplitLayoutExample />,
  },
]

export default function AuthLayoutPage() {
  return (
    <ComponentLayout
      title="Auth Layout"
      description="Flexible authentication layout for login, signup, and password reset pages with customizable branding and split-screen options."
      examples={examples}
    />
  )
}