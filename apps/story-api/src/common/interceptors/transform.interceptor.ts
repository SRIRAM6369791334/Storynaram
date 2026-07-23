import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';
import { successResponse } from '../dto/api-response.dto.js';
import { Request } from 'express';

@Injectable()
export class TransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>();
    const requestId = (request as unknown as Record<string, unknown>).requestId as string | undefined;

    return next.handle().pipe(
      map((data) => successResponse(data, undefined, requestId)),
    );
  }
}
