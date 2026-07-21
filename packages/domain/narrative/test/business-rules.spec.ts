import { describe, it, expect } from 'vitest';
import { SequentialNumberingRule, UniqueChapterNumbersRule, ChapterOrderingRule } from '../src/business-rules';
import { ChapterNumber } from '../src/narrative-numbers';
import { Chapter, ChapterCollection } from '../src/narrative-chapter';
import { WordCount } from '../src/narrative-metrics';

describe('BusinessRules', () => {
  describe('SequentialNumberingRule', () => {
    it('passes when no chapters exist', () => {
      const rule = new SequentialNumberingRule(new ChapterNumber(5), new ChapterCollection());
      expect(rule.check()).toBeNull();
    });

    it('passes for next expected number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
        new Chapter('ch-2', 'Two', new ChapterNumber(2), '', WordCount.zero()),
      ]);
      const rule = new SequentialNumberingRule(new ChapterNumber(3), chapters);
      expect(rule.check()).toBeNull();
    });

    it('fails for non-sequential number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
      ]);
      const rule = new SequentialNumberingRule(new ChapterNumber(3), chapters);
      expect(rule.check()).not.toBeNull();
    });
  });

  describe('UniqueChapterNumbersRule', () => {
    it('passes for new number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
      ]);
      const rule = new UniqueChapterNumbersRule(new ChapterNumber(2), chapters);
      expect(rule.check()).toBeNull();
    });

    it('fails for existing number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
      ]);
      const rule = new UniqueChapterNumbersRule(new ChapterNumber(1), chapters);
      expect(rule.check()).not.toBeNull();
    });
  });

  describe('ChapterOrderingRule', () => {
    it('passes for unique number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
        new Chapter('ch-2', 'Two', new ChapterNumber(2), '', WordCount.zero()),
      ]);
      const rule = new ChapterOrderingRule('ch-3', new ChapterNumber(3), chapters);
      expect(rule.check()).toBeNull();
    });

    it('warns for colliding number', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
        new Chapter('ch-2', 'Two', new ChapterNumber(2), '', WordCount.zero()),
      ]);
      const rule = new ChapterOrderingRule('ch-3', new ChapterNumber(2), chapters);
      expect(rule.check()).not.toBeNull();
    });

    it('skips self when checking collisions', () => {
      const chapters = new ChapterCollection([
        new Chapter('ch-1', 'One', new ChapterNumber(1), '', WordCount.zero()),
        new Chapter('ch-2', 'Two', new ChapterNumber(2), '', WordCount.zero()),
      ]);
      const rule = new ChapterOrderingRule('ch-2', new ChapterNumber(2), chapters);
      expect(rule.check()).toBeNull();
    });
  });
});
