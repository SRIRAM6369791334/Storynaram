import { Injectable } from '@nestjs/common';
import { SchemaDefinition } from './schema-definition';

export interface ValidationIssue {
  path: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

@Injectable()
export abstract class SchemaValidator {
  abstract validate(data: unknown, schema: SchemaDefinition): ValidationIssue[];
  abstract compile(schema: SchemaDefinition): (data: unknown) => ValidationIssue[];
}
