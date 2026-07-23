import { Injectable, Logger } from '@nestjs/common';
import type { PluginId, PluginManifest } from './types.js';
import { PluginConfigurationError } from './errors.js';

@Injectable()
export class PluginConfigurationService {
  private readonly logger = new Logger(PluginConfigurationService.name);
  private readonly configs: Map<PluginId, Record<string, unknown>> = new Map();

  set(pluginId: PluginId, config: Record<string, unknown>): void {
    this.configs.set(pluginId, { ...config });
    this.logger.log(`Configuration set for plugin: ${pluginId}`);
  }

  get(pluginId: PluginId): Record<string, unknown> {
    return { ...(this.configs.get(pluginId) ?? {}) };
  }

  getValue<T>(pluginId: PluginId, key: string, defaultValue?: T): T | undefined {
    const config = this.configs.get(pluginId);
    if (config && key in config) {
      return config[key] as T;
    }
    return defaultValue;
  }

  update(pluginId: PluginId, updates: Record<string, unknown>): void {
    const existing = this.configs.get(pluginId) ?? {};
    this.configs.set(pluginId, { ...existing, ...updates });
    this.logger.log(`Configuration updated for plugin: ${pluginId}`);
  }

  delete(pluginId: PluginId): void {
    this.configs.delete(pluginId);
    this.logger.log(`Configuration deleted for plugin: ${pluginId}`);
  }

  has(pluginId: PluginId): boolean {
    return this.configs.has(pluginId);
  }

  validateAgainstSchema(config: Record<string, unknown>, schema: Record<string, unknown>): string[] {
    const issues: string[] = [];
    const schemaProperties = schema.properties as Record<string, unknown> | undefined;

    if (!schemaProperties) return issues;

    for (const [key, propSchema] of Object.entries(schemaProperties)) {
      const prop = propSchema as Record<string, unknown>;
      if (prop.required && !(key in config)) {
        issues.push(`Missing required configuration key: "${key}"`);
      }
      if (key in config && prop.type) {
        const value = config[key];
        const actualType = typeof value;
        if (prop.type === 'array' && !Array.isArray(value)) {
          issues.push(`Configuration key "${key}" must be an array`);
        } else if (prop.type !== 'array' && actualType !== prop.type) {
          if (prop.type === 'number' && actualType === 'number') {
            // ok
          } else if (prop.type === 'integer' && actualType === 'number' && Number.isInteger(value)) {
            // ok
          } else if (prop.type !== actualType) {
            issues.push(`Configuration key "${key}" must be of type "${prop.type}", got "${actualType}"`);
          }
        }
      }
    }

    return issues;
  }

  validateManifestConfig(manifest: PluginManifest, config: Record<string, unknown>): void {
    const schema = manifest.configurationSchema;
    if (!schema) return;

    const issues = this.validateAgainstSchema(config, schema);
    if (issues.length > 0) {
      throw new PluginConfigurationError(
        `Configuration validation failed for plugin "${manifest.id}"`,
        manifest.id,
        issues,
      );
    }
  }

  setFromOptions(defaultConfig?: Record<PluginId, Record<string, unknown>>): void {
    if (!defaultConfig) return;
    for (const [pluginId, config] of Object.entries(defaultConfig)) {
      this.set(pluginId, config);
    }
  }

  clear(): void {
    this.configs.clear();
  }

  get size(): number {
    return this.configs.size;
  }
}
