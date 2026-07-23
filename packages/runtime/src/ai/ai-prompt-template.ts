import { Injectable } from '@nestjs/common';
import type { AIPromptTemplate } from './types.js';
import { AIValidationError } from './errors.js';

@Injectable()
export class AIPromptTemplateManager {
  private readonly templates: Map<string, AIPromptTemplate> = new Map();
  private readonly templatesByName: Map<string, AIPromptTemplate[]> = new Map();

  register(template: AIPromptTemplate): void {
    this.templates.set(`${template.id}:${template.version}`, template);

    const existing = this.templatesByName.get(template.name) ?? [];
    const existingIndex = existing.findIndex(t => t.version === template.version);
    if (existingIndex >= 0) {
      existing[existingIndex] = template;
    } else {
      existing.push(template);
    }
    this.templatesByName.set(template.name, existing);
  }

  get(id: string, version?: string): AIPromptTemplate | undefined {
    if (version) return this.templates.get(`${id}:${version}`);
    const allVersions = this.listVersions(id);
    return allVersions[allVersions.length - 1];
  }

  getByName(name: string, version?: string): AIPromptTemplate | undefined {
    const templates = this.templatesByName.get(name);
    if (!templates || templates.length === 0) return undefined;
    if (version) return templates.find(t => t.version === version);
    return templates[templates.length - 1];
  }

  list(): AIPromptTemplate[] {
    return Array.from(this.templates.values());
  }

  listVersions(id: string): AIPromptTemplate[] {
    return Array.from(this.templates.values()).filter(t => t.id === id);
  }

  unregister(id: string, version?: string): void {
    if (version) {
      const template = this.templates.get(`${id}:${version}`);
      if (template) {
        this.templates.delete(`${id}:${version}`);
        const byName = this.templatesByName.get(template.name);
        if (byName) {
          const filtered = byName.filter(t => !(t.id === id && t.version === version));
          if (filtered.length > 0) {
            this.templatesByName.set(template.name, filtered);
          } else {
            this.templatesByName.delete(template.name);
          }
        }
      }
    } else {
      const versions = this.listVersions(id);
      for (const t of versions) {
        this.templates.delete(`${t.id}:${t.version}`);
        this.templatesByName.delete(t.name);
      }
    }
  }

  validate(template: AIPromptTemplate): void {
    const issues: string[] = [];
    if (!template.id) issues.push('Template must have an id');
    if (!template.name) issues.push('Template must have a name');
    if (!template.template) issues.push('Template must have content');
    if (!template.version) issues.push('Template must have a version');

    const varPattern = /\{\{\s*(\w+)\s*\}\}/g;
    const foundVars = new Set<string>();
    let match: RegExpExecArray | null;
    while ((match = varPattern.exec(template.template)) !== null) {
      if (match[1]) foundVars.add(match[1]);
    }

    for (const v of template.variables) {
      if (!foundVars.has(v)) {
        issues.push(`Declared variable "${v}" not found in template`);
      }
    }
    for (const v of foundVars) {
      if (!template.variables.includes(v)) {
        issues.push(`Variable "${v}" used in template but not declared`);
      }
    }

    if (issues.length > 0) {
      throw new AIValidationError('Template validation failed', issues);
    }
  }
}
