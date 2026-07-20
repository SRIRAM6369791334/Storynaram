export interface DomainContextProps {
  tenant: string;
  locale: string;
  timezone: string;
  userId: string;
  permissions: string[];
  correlationId: string;
}

export class DomainContext {
  public readonly tenant: string;
  public readonly locale: string;
  public readonly timezone: string;
  public readonly userId: string;
  public readonly permissions: readonly string[];
  public readonly correlationId: string;

  constructor(props: DomainContextProps) {
    this.tenant = props.tenant;
    this.locale = props.locale;
    this.timezone = props.timezone;
    this.userId = props.userId;
    this.permissions = [...props.permissions];
    this.correlationId = props.correlationId;
  }

  hasPermission(permission: string): boolean {
    return this.permissions.includes(permission);
  }

  hasAnyPermission(permissions: string[]): boolean {
    return permissions.some(p => this.permissions.includes(p));
  }

  hasAllPermissions(permissions: string[]): boolean {
    return permissions.every(p => this.permissions.includes(p));
  }

  toJSON(): Record<string, unknown> {
    return {
      tenant: this.tenant,
      locale: this.locale,
      timezone: this.timezone,
      userId: this.userId,
      permissions: [...this.permissions],
      correlationId: this.correlationId,
    };
  }
}
