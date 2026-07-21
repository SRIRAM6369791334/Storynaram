import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ApiKeyGuard implements CanActivate {
  private readonly validApiKeys: Set<string>;

  constructor() {
    const keys = process.env.API_KEYS?.split(',').filter(Boolean) ?? [];
    this.validApiKeys = new Set(keys);
  }

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'] as string | undefined;

    if (!apiKey) {
      throw new UnauthorizedException('API key is required');
    }

    if (!this.validApiKeys.has(apiKey)) {
      throw new UnauthorizedException('Invalid API key');
    }

    return true;
  }
}
