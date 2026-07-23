import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from './domain-event-dispatcher.js';
import { InMemoryDomainEventPublisher } from './domain-event-publisher.js';
import type { IDomainEventPublisher } from './domain-event-publisher.js';

export const DOMAIN_EVENT_PUBLISHER = Symbol('DOMAIN_EVENT_PUBLISHER');
export const DOMAIN_KERNEL_OPTIONS = Symbol('DOMAIN_KERNEL_OPTIONS');

export interface DomainKernelOptions {
  publisher?: IDomainEventPublisher;
}

@Global()
@Module({})
export class DomainKernelModule {
  static forRoot(options?: DomainKernelOptions): DynamicModule {
    const publisher = options?.publisher ?? new InMemoryDomainEventPublisher();

    const providers: Provider[] = [
      DomainEventDispatcher,
      { provide: DOMAIN_EVENT_PUBLISHER, useValue: publisher },
      { provide: DOMAIN_KERNEL_OPTIONS, useValue: options ?? {} },
    ];

    return {
      module: DomainKernelModule,
      providers,
      exports: [
        DomainEventDispatcher,
        DOMAIN_EVENT_PUBLISHER,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: DomainKernelModule,
    };
  }
}
