export interface PublishingCheckpoint {
  id: string;
  stage: string;
  timestamp: Date;
  formatsRendered: string[];
  formatsExported: string[];
  outputSize: number;
}

export function createPublishingCheckpoint(
  stage: string,
  formatsRendered: string[],
  formatsExported: string[],
  outputSize: number,
): PublishingCheckpoint {
  return {
    id: crypto.randomUUID(),
    stage,
    timestamp: new Date(),
    formatsRendered,
    formatsExported,
    outputSize,
  };
}
