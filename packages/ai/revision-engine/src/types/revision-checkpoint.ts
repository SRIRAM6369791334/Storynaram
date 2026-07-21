export interface RevisionCheckpoint {
  id: string;
  passName: string;
  timestamp: Date;
  chapterSnapshots: ChapterSnapshot[];
  totalChangesSoFar: number;
  qualityScore: number;
}

export interface ChapterSnapshot {
  number: number;
  title: string;
  content: string;
  wordCount: number;
}

export function createCheckpoint(
  passName: string,
  chapters: { number: number; title: string; content: string; wordCount: number }[],
  totalChanges: number,
  qualityScore: number,
): RevisionCheckpoint {
  return {
    id: crypto.randomUUID(),
    passName,
    timestamp: new Date(),
    chapterSnapshots: chapters.map(c => ({ number: c.number, title: c.title, content: c.content, wordCount: c.wordCount })),
    totalChangesSoFar: totalChanges,
    qualityScore,
  };
}
