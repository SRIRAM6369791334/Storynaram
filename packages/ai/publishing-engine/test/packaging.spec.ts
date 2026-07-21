import { describe, it, expect } from 'vitest';
import { AssetPackager } from '../src/assets/asset-packager';
import { PackageValidator } from '../src/validation/package-validator';
import { PublishingProfileManager } from '../src/profiles/publishing-profile';

describe('AssetPackager', () => {
  const packager = new AssetPackager();
  const chapters = [
    { number: 1, title: 'Ch1', content: 'This is a story.' },
    { number: 2, title: 'Ch2', content: 'The hero is known as "The Brave".' },
  ];

  it('generates asset manifest', () => {
    const manifest = packager.generateAssetManifest('Test');

    expect(manifest.images).toBeDefined();
    expect(manifest.illustrations).toBeDefined();
    expect(manifest.maps).toBeDefined();
  });

  it('generates glossary', () => {
    const glossary = packager.generateGlossary(chapters);

    expect(typeof glossary).toBe('string');
  });

  it('packages assets', () => {
    const files = packager.packageAssets('Test', chapters);

    expect(files.length).toBeGreaterThan(0);
    const manifest = files.find(f => f.filename === 'asset-manifest.json');
    expect(manifest).toBeDefined();
  });
});

describe('PackageValidator', () => {
  const validator = new PackageValidator();

  it('validates complete package', () => {
    const result = validator.validate({
      chapters: [
        { number: 1, title: 'Ch1', content: 'Content.' },
        { number: 2, title: 'Ch2', content: 'Content.' },
      ],
      renderedFormats: ['novel'],
      exportedFormats: ['pdf', 'html'],
      tocEntries: 2,
      metadataPresent: true,
    });

    expect(result.passed).toBe(true);
    expect(result.checks).toHaveLength(7);
  });

  it('detects missing chapters', () => {
    const result = validator.validate({
      chapters: [],
      renderedFormats: [],
      exportedFormats: [],
      tocEntries: 0,
      metadataPresent: false,
    });

    expect(result.passed).toBe(false);
    expect(result.checks.some(c => c.name === 'MissingChapters' && !c.passed)).toBe(true);
  });

  it('detects invalid TOC', () => {
    const result = validator.validate({
      chapters: [{ number: 1, title: 'Ch1', content: 'x' }],
      renderedFormats: ['novel'],
      exportedFormats: [],
      tocEntries: 0,
      metadataPresent: true,
    });

    const tocCheck = result.checks.find(c => c.name === 'TOCValidity');
    expect(tocCheck).toBeDefined();
    expect(tocCheck!.passed).toBe(false);
  });
});

describe('PublishingProfileManager', () => {
  const manager = new PublishingProfileManager();

  it('returns novel profile by default', () => {
    const profile = manager.getProfile('novel');
    expect(profile.name).toBe('novel');
    expect(profile.renderFormat).toBe('novel');
    expect(profile.pageSize).toBe('6x9');
  });

  it('returns all profiles', () => {
    const profiles = manager.getAllProfiles();
    expect(profiles.length).toBeGreaterThan(1);
    expect(profiles.some(p => p.name === 'screenplay')).toBe(true);
    expect(profiles.some(p => p.name === 'comic')).toBe(true);
  });

  it('falls back to novel for unknown profile', () => {
    const profile = manager.getProfile('unknown' as any);
    expect(profile.name).toBe('novel');
  });

  it('provides default options for profiles', () => {
    const options = manager.getDefaultOptions('screenplay');
    expect(options.renderFormat).toBe('screenplay');
    expect(options.exportFormats).toContain('pdf');
  });
});
