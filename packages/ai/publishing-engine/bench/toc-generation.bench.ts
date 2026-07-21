import { bench, describe } from 'vitest';
import { TOCGenerator } from '../src/toc/toc-generator';

const gen = new TOCGenerator();

const smallBook = Array.from({ length: 10 }, (_, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}: ${['The Beginning', 'The Journey', 'The Challenge', 'The Discovery', 'The Battle', 'The Aftermath', 'The Return', 'The Revelation', 'The Climax', 'The End'][i]}`,
}));

const largeBook = Array.from({ length: 100 }, (_, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}: Story Event Number ${i + 1}`,
}));

describe('TOC Generation Performance', () => {
  bench('generate TOC - 10 chapters', () => {
    gen.generateTOC(smallBook);
  });

  bench('generate TOC - 100 chapters', () => {
    gen.generateTOC(largeBook);
  });

  bench('generate full TOC - 10 chapters', () => {
    gen.generateFullTOC('Test Book', smallBook, {
      includeChapterIndex: true,
      includeCharacterIndex: true,
      includeLocationIndex: true,
    });
  });

  bench('generate book TOC - 100 chapters', () => {
    gen.generateBookTOC(largeBook);
  });

  bench('count TOC entries - 100 chapters', () => {
    gen.countTOCEntries(largeBook);
  });
});
