import { bench, describe } from 'vitest';
import { SequentialNumberingRule, UniqueChapterNumbersRule, ChapterOrderingRule } from '../src/business-rules';
import { ChapterNumber } from '../src/narrative-numbers';
import { Chapter, ChapterCollection } from '../src/narrative-chapter';
import { WordCount } from '../src/narrative-metrics';

describe('Narrative BusinessRules benchmarks', () => {
  const chapters = new ChapterCollection(
    Array.from({ length: 10 }, (_, i) =>
      new Chapter(`ch-${i}`, `Chapter ${i + 1}`, new ChapterNumber(i + 1), '', WordCount.zero()),
    ),
  );

  bench('sequential numbering check (valid)', () => {
    new SequentialNumberingRule(new ChapterNumber(11), chapters).check();
  });

  bench('unique chapter numbers check', () => {
    new UniqueChapterNumbersRule(new ChapterNumber(11), chapters).check();
  });

  bench('chapter ordering check', () => {
    new ChapterOrderingRule('ch-new', new ChapterNumber(5), chapters).check();
  });
});
