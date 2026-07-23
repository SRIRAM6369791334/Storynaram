import { EntityRuntimeError } from '../errors.js';

export class PluginError extends EntityRuntimeError {
  constructor(message: string, code?: string) {
    super(message, code);
    this.name = 'PluginError';
  }
}

export class PluginLoadError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId: string,
  ) {
    super(message, 'PLUGIN_LOAD_ERROR');
    this.name = 'PluginLoadError';
  }
}

export class PluginDependencyError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly dependencyId: string,
  ) {
    super(message, 'PLUGIN_DEPENDENCY_ERROR');
    this.name = 'PluginDependencyError';
  }
}

export class PluginPermissionError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly resource: string,
    public readonly action: string,
  ) {
    super(message, 'PLUGIN_PERMISSION_ERROR');
    this.name = 'PluginPermissionError';
  }
}

export class PluginConfigurationError extends PluginError {
  constructor(
    message: string,
    public readonly pluginId: string,
    public readonly issues: string[] = [],
  ) {
    super(message, 'PLUGIN_CONFIGURATION_ERROR');
    this.name = 'PluginConfigurationError';
  }
}
