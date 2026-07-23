import { BusinessRule, BusinessRuleViolation, Severity } from '@storynaram/domain-kernel';
import { ChapterNumber } from './narrative-numbers.js';
import { ChapterCollection } from './narrative-chapter.js';

export class SequentialNumberingRule extends BusinessRule {
  constructor(
    private readonly newNumber: ChapterNumber,
    private readonly chapters: ChapterCollection,
  ) {
    super();
  }

  get ruleName(): string { return 'SequentialNumbering'; }
  get errorCode(): string { return 'NARRATIVE_SEQUENTIAL'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    const sorted = this.chapters.sorted();
    if (sorted.length === 0) return null;
    const nextExpected = sorted[sorted.length - 1]!.chapterNumber.value + 1;
    if (this.newNumber.value !== nextExpected) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Expected chapter number ${nextExpected}, got ${this.newNumber.value}`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class UniqueChapterNumbersRule extends BusinessRule {
  constructor(
    private readonly number: ChapterNumber,
    private readonly chapters: ChapterCollection,
  ) {
    super();
  }

  get ruleName(): string { return 'UniqueChapterNumbers'; }
  get errorCode(): string { return 'NARRATIVE_UNIQUE_CHAPTER'; }
  get severity(): Severity { return Severity.ERROR; }

  check(): BusinessRuleViolation | null {
    if (this.chapters.getByNumber(this.number)) {
      return new BusinessRuleViolation(
        this.ruleName,
        `Chapter number ${this.number.value} already exists`,
        this.errorCode,
        this.severity,
      );
    }
    return null;
  }
}

export class ChapterOrderingRule extends BusinessRule {
  constructor(
    private readonly chapterId: string,
    private readonly newNumber: ChapterNumber,
    private readonly chapters: ChapterCollection,
  ) {
    super();
  }

  get ruleName(): string { return 'ChapterOrdering'; }
  get errorCode(): string { return 'NARRATIVE_CHAPTER_ORDER'; }
  get severity(): Severity { return Severity.WARNING; }

  check(): BusinessRuleViolation | null {
    const sorted = this.chapters.sorted();
    for (const ch of sorted) {
      if (ch.chapterId === this.chapterId) continue;
      if (ch.chapterNumber.value === this.newNumber.value) {
        return new BusinessRuleViolation(
          this.ruleName,
          `Chapter number ${this.newNumber.value} collides with ${ch.title}`,
          this.errorCode,
          this.severity,
        );
      }
    }
    return null;
  }
}
