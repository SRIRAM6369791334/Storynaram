export abstract class DomainService {
  protected readonly serviceName: string;

  constructor(serviceName?: string) {
    this.serviceName = serviceName ?? this.constructor.name;
  }
}
