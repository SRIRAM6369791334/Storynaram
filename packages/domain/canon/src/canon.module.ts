import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { CanonFactory } from './canon-factory';
import { CanonDomainService } from './canon-domain-service';
import { CANON_REPOSITORY } from './canon-repository';

@Global()
@Module({})
export class CanonDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      CanonFactory,
      CanonDomainService,
      DomainEventDispatcher,
    ];

    return {
      module: CanonDomainModule,
      providers,
      exports: [
        CanonFactory,
        CanonDomainService,
        DomainEventDispatcher,
        CANON_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: CanonDomainModule,
    };
  }
}
