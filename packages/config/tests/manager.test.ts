import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ConfigManager, getConfigManager, config } from '../src/manager';
import { BaseConfig } from '../src/environments/base';

describe('Configuration Manager', () => {
  let manager: ConfigManager;

  beforeEach(() => {
    manager = new ConfigManager('test');
  });

  describe('ConfigManager', () => {
    it('should initialize with test environment', async () => {
      await manager.initialize();
      
      expect(manager.isInitialized()).toBe(true);
      expect(manager.getCurrentEnvironment()).toBe('test');
    });

    it('should get configuration after initialization', async () => {
      await manager.initialize();
      
      const config = manager.getConfig();
      expect(config).toBeDefined();
      expect(config.env.NODE_ENV).toBe('test');
    });

    it('should throw error when accessing config before initialization', () => {
      expect(() => manager.getConfig()).toThrow('Configuration manager not initialized');
    });

    it('should get configuration sections', async () => {
      await manager.initialize();
      
      const appConfig = manager.getAppMetadata();
      expect(appConfig.name).toBe('NextSaaS Test');
      
      const dbConfig = manager.getDatabaseConfig();
      expect(dbConfig.provider).toBe('sqlite');
      
      const authConfig = manager.getAuthConfig();
      expect(authConfig.jwt.secret).toBeDefined();
    });

    it('should get nested configuration values', async () => {
      await manager.initialize();
      
      const port = manager.get('env.PORT');
      expect(port).toBe(3001);
      
      const appName = manager.get('app.name');
      expect(appName).toBe('NextSaaS Test');
      
      const dbProvider = manager.get('database.provider');
      expect(dbProvider).toBe('sqlite');
    });

    it('should return default value for missing path', async () => {
      await manager.initialize();
      
      const missing = manager.get('non.existent.path', 'default-value');
      expect(missing).toBe('default-value');
    });

    it('should check if configuration path exists', async () => {
      await manager.initialize();
      
      expect(manager.has('app.name')).toBe(true);
      expect(manager.has('non.existent.path')).toBe(false);
    });

    it('should check feature flags', async () => {
      await manager.initialize();
      
      expect(manager.isFeatureEnabled('authentication')).toBe(true);
      expect(manager.isFeatureEnabled('billing')).toBe(true);
      expect(manager.isFeatureEnabled('multiTenant')).toBe(true); // Enabled in test
    });

    it('should validate configuration', async () => {
      await manager.initialize();
      
      const validation = await manager.validate();
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
    });

    it('should reload configuration', async () => {
      await manager.initialize();
      const config1 = manager.getConfig();
      
      await manager.reload();
      const config2 = manager.getConfig();
      
      expect(config2).not.toBe(config1); // Different object
      expect(config2.env.NODE_ENV).toBe(config1.env.NODE_ENV); // Same values
    });

    it('should switch environment', async () => {
      await manager.initialize();
      expect(manager.getCurrentEnvironment()).toBe('test');
      
      await manager.switchEnvironment('development');
      expect(manager.getCurrentEnvironment()).toBe('development');
      
      const config = manager.getConfig();
      expect(config.env.NODE_ENV).toBe('development');
    });

    it('should get sanitized configuration', async () => {
      await manager.initialize({
        envVars: {
          JWT_SECRET: 'super-secret-value',
          DATABASE_URL: 'postgresql://user:pass@localhost:5432/db',
        },
      });
      
      const sanitized = manager.getSanitizedConfig();
      expect(sanitized.auth?.jwt?.secret).toBe('***REDACTED***');
      expect(sanitized.database?.url).toBe('***REDACTED***');
    });

    it('should export configuration', async () => {
      await manager.initialize();
      
      const json = manager.export('json');
      const parsed = JSON.parse(json);
      expect(parsed.env.NODE_ENV).toBe('test');
    });

    it('should handle middleware', async () => {
      const middleware = vi.fn((config) => {
        config.app.name = 'Modified by Middleware';
        return config;
      });
      
      manager.use(middleware);
      await manager.initialize();
      
      const config = manager.getConfig();
      expect(config.app.name).toBe('Modified by Middleware');
      expect(middleware).toHaveBeenCalled();
    });

    it('should handle configuration watchers', async () => {
      const watcher = vi.fn();
      manager.watch(watcher);
      
      await manager.initialize();
      await manager.reload();
      
      expect(watcher).toHaveBeenCalledTimes(2); // Once for init, once for reload
    });

    it('should emit events', async () => {
      const initialized = vi.fn();
      const configChanged = vi.fn();
      const error = vi.fn();
      
      manager.on('initialized', initialized);
      manager.on('configChanged', configChanged);
      manager.on('error', error);
      
      await manager.initialize();
      
      expect(initialized).toHaveBeenCalled();
      expect(configChanged).toHaveBeenCalled();
      expect(error).not.toHaveBeenCalled();
    });
  });

  describe('Global Configuration Manager', () => {
    it('should create singleton instance', () => {
      const manager1 = getConfigManager();
      const manager2 = getConfigManager();
      
      expect(manager1).toBe(manager2);
    });

    it('should use config helper for type-safe access', async () => {
      await getConfigManager().initialize();
      
      expect(config.env().NODE_ENV).toBe('test');
      expect(config.app().name).toBe('NextSaaS Test');
      expect(config.database().provider).toBe('sqlite');
      expect(config.feature('authentication')).toBe(true);
      
      const customValue = config.value('app.supportEmail', 'default@example.com');
      expect(customValue).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle middleware errors', async () => {
      const errorMiddleware = vi.fn(() => {
        throw new Error('Middleware error');
      });
      
      manager.use(errorMiddleware);
      
      await expect(manager.initialize()).rejects.toThrow('Middleware failed');
    });

    it('should handle watcher errors gracefully', async () => {
      const errorWatcher = vi.fn(() => {
        throw new Error('Watcher error');
      });
      
      const watcherError = vi.fn();
      manager.on('watcherError', watcherError);
      
      manager.watch(errorWatcher);
      await manager.initialize();
      
      expect(watcherError).toHaveBeenCalled();
    });
  });
});