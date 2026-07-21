export class PublishingStartedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly chapterCount: number,
    public readonly formats: string[],
  ) {}
}

export class RenderingCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly renderFormat: string,
    public readonly size: number,
    public readonly durationMs: number,
  ) {}
}

export class MetadataGeneratedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly title: string,
    public readonly author: string,
  ) {}
}

export class AssetsPackagedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly assetCount: number,
  ) {}
}

export class ExportCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly format: string,
    public readonly filename: string,
    public readonly size: number,
  ) {}
}

export class PublishingCompletedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly storyTitle: string,
    public readonly formatsRendered: number,
    public readonly formatsExported: number,
    public readonly totalSize: number,
  ) {}
}

export class PublishingFailedEvent {
  constructor(
    public readonly sessionId: string,
    public readonly error: string,
  ) {}
}
