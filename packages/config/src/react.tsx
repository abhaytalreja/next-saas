import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { BaseConfig, Environment, ConfigLoaderOptions, ConfigLoadResult, loadConfig, getCurrentEnvironment } from './loader';

/**
 * React Configuration Context Provider
 * 
 * This module provides React context and hooks for accessing configuration
 * in React applications. It ensures type-safe access to configuration
 * and handles loading states and errors.
 */

// Configuration context
export interface ConfigContextValue {
  config: BaseConfig | null;
  environment: Environment;
  loading: boolean;
  error: Error | null;
  validationErrors: string[];
  missingEnvVars: string[];
  warnings: string[];
  reload: () => Promise<void>;
  isInitialized: boolean;
}

const ConfigContext = createContext<ConfigContextValue | undefined>(undefined);

// Configuration provider props
export interface ConfigProviderProps {
  children: ReactNode;
  options?: ConfigLoaderOptions;
  fallback?: ReactNode;
  onError?: (error: Error) => void;
  onLoaded?: (config: BaseConfig) => void;
}

/**
 * Configuration Provider Component
 * 
 * Provides configuration context to child components with loading states
 * and error handling.
 */
export function ConfigProvider({ 
  children, 
  options = {}, 
  fallback = null,
  onError,
  onLoaded
}: ConfigProviderProps) {
  const [config, setConfig] = useState<BaseConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [missingEnvVars, setMissingEnvVars] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const environment = options.environment || getCurrentEnvironment();

  const loadConfiguration = async () => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors([]);
      setMissingEnvVars([]);
      setWarnings([]);

      const result: ConfigLoadResult = await loadConfig({
        throwOnError: false,
        ...options,
      });

      setConfig(result.config);
      setValidationErrors(result.validationErrors);
      setMissingEnvVars(result.missingEnvVars);
      setWarnings(result.warnings);
      setIsInitialized(true);

      // Call onLoaded callback if provided
      if (onLoaded) {
        onLoaded(result.config);
      }

      // Log warnings and errors
      if (result.validationErrors.length > 0) {
        console.error('Configuration validation errors:', result.validationErrors);
      }
      if (result.missingEnvVars.length > 0) {
        console.error('Missing required environment variables:', result.missingEnvVars);
      }
      if (result.warnings.length > 0) {
        console.warn('Configuration warnings:', result.warnings);
      }

    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      setIsInitialized(false);
      
      // Call onError callback if provided
      if (onError) {
        onError(error);
      }
      
      console.error('Failed to load configuration:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load configuration on mount
  useEffect(() => {
    loadConfiguration();
  }, []);

  // Reload function
  const reload = async () => {
    await loadConfiguration();
  };

  const contextValue: ConfigContextValue = {
    config,
    environment,
    loading,
    error,
    validationErrors,
    missingEnvVars,
    warnings,
    reload,
    isInitialized,
  };

  // Show fallback while loading
  if (loading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <ConfigContext.Provider value={contextValue}>
      {children}
    </ConfigContext.Provider>
  );
}

/**
 * Hook to access configuration context
 */
export function useConfig(): ConfigContextValue {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}

/**
 * Hook to access configuration data directly
 */
export function useConfigData(): BaseConfig {
  const { config, loading, error } = useConfig();
  
  if (loading) {
    throw new Error('Configuration is still loading');
  }
  
  if (error) {
    throw error;
  }
  
  if (!config) {
    throw new Error('Configuration not available');
  }
  
  return config;
}

/**
 * Hook to access specific configuration section
 */
export function useConfigSection<K extends keyof BaseConfig>(
  section: K
): BaseConfig[K] {
  const config = useConfigData();
  return config[section];
}

/**
 * Hook to access feature flags
 */
export function useFeatureFlags() {
  return useConfigSection('features');
}

/**
 * Hook to check if a feature is enabled
 */
export function useFeature(featureName: keyof BaseConfig['features']): boolean {
  const features = useFeatureFlags();
  return features[featureName] ?? false;
}

/**
 * Hook to access app metadata
 */
export function useAppMetadata() {
  return useConfigSection('app');
}

/**
 * Hook to access environment configuration
 */
export function useEnvironment() {
  return useConfigSection('env');
}

/**
 * Hook to access security configuration
 */
export function useSecurityConfig() {
  return useConfigSection('security');
}

/**
 * Hook to access database configuration
 */
export function useDatabaseConfig() {
  return useConfigSection('database');
}

/**
 * Hook to access authentication configuration
 */
export function useAuthConfig() {
  return useConfigSection('auth');
}

/**
 * Hook to access email configuration
 */
export function useEmailConfig() {
  return useConfigSection('email');
}

/**
 * Hook to access storage configuration
 */
export function useStorageConfig() {
  return useConfigSection('storage');
}

/**
 * Hook to access billing configuration
 */
export function useBillingConfig() {
  return useConfigSection('billing');
}

/**
 * Hook to access integrations configuration
 */
export function useIntegrationsConfig() {
  return useConfigSection('integrations');
}

/**
 * Hook to access monitoring configuration
 */
export function useMonitoringConfig() {
  return useConfigSection('monitoring');
}

/**
 * Hook to access cache configuration
 */
export function useCacheConfig() {
  return useConfigSection('cache');
}

/**
 * Hook to access API configuration
 */
export function useApiConfig() {
  return useConfigSection('api');
}

/**
 * Higher-order component to provide configuration context
 */
export function withConfig<P extends object>(
  Component: React.ComponentType<P>,
  options?: ConfigLoaderOptions
) {
  return function WithConfigComponent(props: P) {
    return (
      <ConfigProvider options={options}>
        <Component {...props} />
      </ConfigProvider>
    );
  };
}

/**
 * Component to conditionally render based on feature flags
 */
export interface FeatureGateProps {
  feature: keyof BaseConfig['features'];
  children: ReactNode;
  fallback?: ReactNode;
}

export function FeatureGate({ feature, children, fallback = null }: FeatureGateProps) {
  const isEnabled = useFeature(feature);
  return isEnabled ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to conditionally render based on environment
 */
export interface EnvironmentGateProps {
  environments: Environment[];
  children: ReactNode;
  fallback?: ReactNode;
}

export function EnvironmentGate({ environments, children, fallback = null }: EnvironmentGateProps) {
  const { environment } = useConfig();
  const isAllowed = environments.includes(environment);
  return isAllowed ? <>{children}</> : <>{fallback}</>;
}

/**
 * Component to display configuration errors
 */
export interface ConfigErrorDisplayProps {
  showValidationErrors?: boolean;
  showMissingEnvVars?: boolean;
  showWarnings?: boolean;
  className?: string;
}

export function ConfigErrorDisplay({
  showValidationErrors = true,
  showMissingEnvVars = true,
  showWarnings = true,
  className = '',
}: ConfigErrorDisplayProps) {
  const { validationErrors, missingEnvVars, warnings, error } = useConfig();
  
  const hasErrors = error || validationErrors.length > 0 || missingEnvVars.length > 0;
  const hasWarnings = warnings.length > 0;
  
  if (!hasErrors && !hasWarnings) {
    return null;
  }
  
  return (
    <div className={`config-errors ${className}`}>
      {error && (
        <div className="config-error">
          <h4>Configuration Error</h4>
          <p>{error.message}</p>
        </div>
      )}
      
      {showValidationErrors && validationErrors.length > 0 && (
        <div className="config-validation-errors">
          <h4>Validation Errors</h4>
          <ul>
            {validationErrors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        </div>
      )}
      
      {showMissingEnvVars && missingEnvVars.length > 0 && (
        <div className="config-missing-env-vars">
          <h4>Missing Environment Variables</h4>
          <ul>
            {missingEnvVars.map((envVar, index) => (
              <li key={index}>{envVar}</li>
            ))}
          </ul>
        </div>
      )}
      
      {showWarnings && warnings.length > 0 && (
        <div className="config-warnings">
          <h4>Configuration Warnings</h4>
          <ul>
            {warnings.map((warning, index) => (
              <li key={index}>{warning}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

/**
 * Component to display configuration loading state
 */
export interface ConfigLoadingProps {
  className?: string;
  text?: string;
}

export function ConfigLoading({ className = '', text = 'Loading configuration...' }: ConfigLoadingProps) {
  return (
    <div className={`config-loading ${className}`}>
      <div className="config-loading-spinner" />
      <p>{text}</p>
    </div>
  );
}