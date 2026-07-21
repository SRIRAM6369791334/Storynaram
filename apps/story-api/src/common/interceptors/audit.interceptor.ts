import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { Request } from 'express';

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger('Audit');

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const { method, url, ip } = request;
    const user = (request as unknown as Record<string, unknown>).user as Record<string, unknown> | undefined;
    const userId = user?.sub ?? 'anonymous';
    const now = new Date().toISOString();

    return next.handle().pipe(
      tap(() => {
        const response = ctx.getResponse();
        this.logger.log(`[${now}] ${userId} ${method} ${url} ${response.statusCode} from ${ip}`);
      }),
    );
  }
}
