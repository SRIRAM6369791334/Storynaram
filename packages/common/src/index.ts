export const AppConstants = {
  APP_NAME: 'Storynaram',
  VERSION: '2.1.0',
  NODE_ENV: process.env.NODE_ENV ?? 'development',
} as const;

export namespace Utils {
  export function isNonEmptyString(value: unknown): value is string {
    return typeof value === 'string' && value.length > 0;
  }

  export function isPlainObject(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
  }

  export function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  export function capitalize(value: string): string {
    if (value.length === 0) return value;
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
