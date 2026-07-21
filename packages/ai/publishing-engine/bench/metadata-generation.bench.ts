import { bench, describe } from 'vitest';
import { MetadataGenerator } from '../src/metadata/metadata-generator';
import { CoverGenerator } from '../src/cover/cover-generator';

const metadataGen = new MetadataGenerator();
const coverGen = new CoverGenerator();

const input = {
  title: 'The Hero\'s Journey: A Long Fantasy Novel Title',
  subtitle: 'Book One of the Epic Saga',
  author: 'Fictional Author Name',
  language: 'en',
  genre: ['fantasy', 'adventure', 'epic'],
  tags: ['magic', 'dragons', 'heroes', 'quest', 'battle'],
  description: 'A young hero embarks on a perilous journey to save their kingdom from darkness.',
  keywords: ['hero', 'journey', 'fantasy', 'magic', 'adventure'],
  version: '2.1.0',
  revision: '3',
  copyright: '© 2026 Fictional Author. All Rights Reserved.',
  license: 'All Rights Reserved',
  isbn: '978-3-16-148410-0',
  publisher: 'Storynaram Press',
  series: 'The Epic Saga',
  volume: 1,
};

describe('Metadata Generation Performance', () => {
  bench('generate full metadata package', () => {
    metadataGen.generate(input);
  });

  bench('generate cover metadata', () => {
    metadataGen.generateCover(input);
  });

  bench('generate HTML metadata', () => {
    const metadata = metadataGen.generate(input);
    metadataGen.generateHTMLMetadata(metadata);
  });

  bench('generate JSON metadata', () => {
    const metadata = metadataGen.generate(input);
    metadataGen.generateJSONMetadata(metadata);
  });
});

describe('Cover Generation Performance', () => {
  bench('generate cover text', () => {
    coverGen.generateCoverText({
      title: input.title, author: input.author, subtitle: input.subtitle,
    });
  });

  bench('generate HTML cover', () => {
    coverGen.generateHTMLCover({
      title: input.title, author: input.author, series: input.series, volume: input.volume,
    });
  });
});
