export abstract class DomainError extends Error {
  public abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class AggregateError extends DomainError {
  public readonly code = 'AGGREGATE_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class BusinessRuleError extends DomainError {
  public readonly code = 'BUSINESS_RULE_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class SpecificationError extends DomainError {
  public readonly code = 'SPECIFICATION_ERROR';

  constructor(message: string) {
    super(message);
  }
}

export class FactoryError extends DomainError {
  public readonly code = 'FACTORY_ERROR';

  constructor(message: string) {
    super(message);
  }
}
