import { Injectable } from '@nestjs/common';
import type { AIMessage, AIMessageRole, AIPromptOptions, AIPromptTemplate } from './types.js';
import { AIValidationError } from './errors.js';

@Injectable()
export class AIPromptBuilder {
  private messages: AIMessage[] = [];
  private systemPrompt: string | null = null;
  private developerPrompt: string | null = null;

  static create(): AIPromptBuilder {
    return new AIPromptBuilder();
  }

  addSystem(content: string): this {
    this.systemPrompt = content;
    return this;
  }

  addDeveloper(content: string): this {
    this.developerPrompt = content;
    return this;
  }

  addUser(content: string, name?: string): this {
    this.messages.push({ role: 'user', content, ...(name ? { name } : {}) });
    return this;
  }

  addAssistant(content: string, toolCalls?: AIMessage['toolCalls']): this {
    this.messages.push({ role: 'assistant', content, ...(toolCalls ? { toolCalls } : {}) });
    return this;
  }

  addToolResult(toolCallId: string, content: string): this {
    this.messages.push({ role: 'tool', content, toolCallId });
    return this;
  }

  addMessage(message: AIMessage): this {
    this.messages.push(message);
    return this;
  }

  addMessages(messages: AIMessage[]): this {
    this.messages.push(...messages);
    return this;
  }

  setSystemPrompt(prompt: string): this {
    this.systemPrompt = prompt;
    return this;
  }

  setDeveloperPrompt(prompt: string): this {
    this.developerPrompt = prompt;
    return this;
  }

  build(): AIMessage[] {
    const result: AIMessage[] = [];

    if (this.systemPrompt) {
      result.push({ role: 'system', content: this.systemPrompt });
    }

    if (this.developerPrompt) {
      result.push({ role: 'developer', content: this.developerPrompt });
    }

    result.push(...this.messages);

    this.validate(result);
    return result;
  }

  buildWithOptions(options: AIPromptOptions): AIMessage[] {
    this.reset();

    if (options.systemPrompt) {
      this.addSystem(options.systemPrompt);
    }

    if (options.developerPrompt) {
      this.addDeveloper(options.developerPrompt);
    }

    if (options.messages) {
      this.addMessages(options.messages);
    }

    if (options.template) {
      const template = typeof options.template === 'string'
        ? { id: 'inline', version: '1.0', name: 'inline', template: options.template, variables: [] }
        : options.template;

      const rendered = this.renderTemplate(template, options.variables ?? {});
      if (template.systemPrompt) {
        this.addSystem(template.systemPrompt);
      }
      this.addUser(rendered);
    }

    return this.build();
  }

  reset(): void {
    this.messages = [];
    this.systemPrompt = null;
    this.developerPrompt = null;
  }

  renderTemplate(template: AIPromptTemplate, variables: Record<string, string>): string {
    let result = template.template;
    const missingVars: string[] = [];

    for (const variable of template.variables) {
      const value = variables[variable];
      if (value === undefined) {
        missingVars.push(variable);
      } else {
        result = result.replace(new RegExp(`\\{\\{\\s*${variable}\\s*\\}\\}`, 'g'), value);
      }
    }

    if (missingVars.length > 0) {
      throw new AIValidationError(
        `Missing template variables: ${missingVars.join(', ')}`,
        missingVars.map(v => `Missing variable: ${v}`),
      );
    }

    return result;
  }

  private validate(messages: AIMessage[]): void {
    const issues: string[] = [];
    for (let i = 0; i < messages.length; i++) {
      const msg = messages[i]!;
      if (!msg.content && (!msg.toolCalls || msg.toolCalls.length === 0) && msg.role !== 'tool') {
        issues.push(`Message at index ${i} has no content and no tool calls`);
      }
    }
    if (issues.length > 0) {
      throw new AIValidationError('Prompt validation failed', issues);
    }
  }
}
