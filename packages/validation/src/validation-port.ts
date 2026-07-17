import { Injectable } from '@nestjs/common';
import { ValidationResult } from './validation-result';

@Injectable()
export abstract class ValidationPort {
  abstract validate(data: unknown, schemaRef: string): Promise<ValidationResult>;
  abstract validateMany(data: unknown[], schemaRef: string): Promise<ValidationResult[]>;
}
