import { bench, describe } from 'vitest';
import { AssetPackager } from '../src/assets/asset-packager';
import { PackageValidator } from '../src/validation/package-validator';

const packager = new AssetPackager();
const validator = new PackageValidator();

const chapters = Array.from({ length: 50 }, (_, i) => ({
  number: i + 1,
  title: `Chapter ${i + 1}`,
  content: `This chapter contains the story progression. The hero is known as "The Brave One" and continues their adventure.`,
}));

describe('Asset Packaging Performance', () => {
  bench('packaging assets - 50 chapters', () => {
    packager.packageAssets('Test Story', chapters);
  });

  bench('glossary generation - 50 chapters', () => {
    packager.generateGlossary(chapters);
  });
});

describe('Validation Performance', () => {
  bench('package validation - 50 chapters', () => {
    validator.validate({
      chapters: chapters.map(c => ({ number: c.number, title: c.title, content: c.content })),
      renderedFormats: ['novel', 'html', 'markdown', 'json'],
      exportedFormats: ['pdf', 'epub', 'html', 'txt'],
      tocEntries: 50,
      metadataPresent: true,
    });
  });
});
