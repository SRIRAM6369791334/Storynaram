import { DynamicModule, Injectable } from '@nestjs/common';
import { trace, Tracer, Span } from '@opentelemetry/api';

@Injectable()
export class TraceService {
  private readonly tracer: Tracer;

  constructor(name?: string) {
    this.tracer = trace.getTracer(name ?? 'storynaram');
  }

  getTracer(): Tracer {
    return this.tracer;
  }

  startSpan(name: string): Span {
    return this.tracer.startSpan(name);
  }
}

export abstract class TelemetryPort {
  abstract recordMetric(name: string, value: number, attributes?: Record<string, string>): void;
  abstract startActiveSpan(name: string, fn: (span: Span) => Promise<void>): Promise<void>;
}

export class TelemetryModule {
  static forRoot(): DynamicModule {
    return {
      module: TelemetryModule,
      global: true,
      providers: [TraceService],
      exports: [TraceService],
    };
  }
}
