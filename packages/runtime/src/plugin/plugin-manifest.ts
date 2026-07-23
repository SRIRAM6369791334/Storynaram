import { Injectable, Logger } from '@nestjs/common';
import type { PluginManifest, PluginId } from './types.js';
import { PluginError, PluginConfigurationError } from './errors.js';

@Injectable()
export class PluginManifestService {
  private readonly logger = new Logger(PluginManifestService.name);

  validate(manifest: PluginManifest): void {
    const issues: string[] = [];

    if (!manifest.id || typeof manifest.id !== 'string') {
      issues.push('Manifest must have a string "id"');
    }
    if (!manifest.name || typeof manifest.name !== 'string') {
      issues.push('Manifest must have a string "name"');
    }
    if (!manifest.version || typeof manifest.version !== 'string') {
      issues.push('Manifest must have a string "version"');
    }

    if (manifest.dependencies) {
      if (!Array.isArray(manifest.dependencies)) {
        issues.push('"dependencies" must be an array');
      } else {
        for (const dep of manifest.dependencies) {
          if (!dep.id) {
            issues.push('Each dependency must have an "id"');
          }
        }
      }
    }

    if (manifest.peerDependencies) {
      if (!Array.isArray(manifest.peerDependencies)) {
        issues.push('"peerDependencies" must be an array');
      } else {
        for (const dep of manifest.peerDependencies) {
          if (!dep.id) {
            issues.push('Each peerDependency must have an "id"');
          }
        }
      }
    }

    if (manifest.permissions) {
      if (!Array.isArray(manifest.permissions)) {
        issues.push('"permissions" must be an array');
      } else {
        for (const perm of manifest.permissions) {
          if (!perm.resource) {
            issues.push('Each permission must have a "resource"');
          }
          if (!Array.isArray(perm.actions)) {
            issues.push(`Permission for "${perm.resource}" must have an "actions" array`);
          }
        }
      }
    }

    if (manifest.capabilities) {
      if (!Array.isArray(manifest.capabilities)) {
        issues.push('"capabilities" must be an array');
      } else {
        for (const cap of manifest.capabilities) {
          if (!cap.name) {
            issues.push('Each capability must have a "name"');
          }
          if (!cap.version) {
            issues.push(`Capability "${cap.name}" must have a "version"`);
          }
        }
      }
    }

    if (issues.length > 0) {
      throw new PluginConfigurationError('Invalid plugin manifest', manifest.id ?? 'unknown', issues);
    }
  }

  verifyEntrypoint(manifest: PluginManifest): boolean {
    return !!manifest.entrypoint;
  }

  getDependencyIds(manifest: PluginManifest): PluginId[] {
    const deps: PluginId[] = [];
    if (manifest.dependencies) {
      deps.push(...manifest.dependencies.map(d => d.id));
    }
    if (manifest.peerDependencies) {
      deps.push(...manifest.peerDependencies.map(d => d.id));
    }
    return deps;
  }

  getRequiredDependencyIds(manifest: PluginManifest): PluginId[] {
    const deps: PluginId[] = [];
    if (manifest.dependencies) {
      deps.push(...manifest.dependencies.filter(d => !d.optional).map(d => d.id));
    }
    return deps;
  }

  getOptionalDependencyIds(manifest: PluginManifest): PluginId[] {
    const deps: PluginId[] = [];
    if (manifest.dependencies) {
      deps.push(...manifest.dependencies.filter(d => d.optional).map(d => d.id));
    }
    if (manifest.peerDependencies) {
      deps.push(...manifest.peerDependencies.map(d => d.id));
    }
    return deps;
  }
}
