import { Module, DynamicModule, Global, Provider } from '@nestjs/common';
import { DomainEventDispatcher } from '@storynaram/domain-kernel';
import { CharacterFactory } from './character-factory';
import { CharacterLifecycle } from './character-lifecycle';
import { CharacterDomainService } from './character-domain-service';
import { CHARACTER_REPOSITORY } from './character-repository';

@Global()
@Module({})
export class CharacterDomainModule {
  static forRoot(): DynamicModule {
    const providers: Provider[] = [
      CharacterFactory,
      CharacterLifecycle,
      CharacterDomainService,
      DomainEventDispatcher,
    ];

    return {
      module: CharacterDomainModule,
      providers,
      exports: [
        CharacterFactory,
        CharacterLifecycle,
        CharacterDomainService,
        DomainEventDispatcher,
        CHARACTER_REPOSITORY,
      ],
    };
  }

  static forFeature(): DynamicModule {
    return {
      module: CharacterDomainModule,
    };
  }
}
