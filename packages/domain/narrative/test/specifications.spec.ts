import { describe, it, expect } from 'vitest';
import { NarrativeAggregate } from '../src/narrative-aggregate';
import { NarrativeIdentity } from '../src/narrative-identity';
import {
  PublishedSpec,
  DraftSpec,
  CompletedSpec,
  InProgressSpec,
  NovelSpec,
  ComicSpec,
  ScreenplaySpec,
  InteractiveSpec,
  SeriesSpec,
  StandaloneSpec,
} from '../src/narrative-specifications';
import { NarrativeStatus } from '../src/narrative-status';
import { NarrativeProfile } from '../src/narrative-profile';
import { NarrativeTitle } from '../src/narrative-title';

describe('Specifications', () => {
  it('PublishedSpec matches published narrative', () => {
    const spec = new PublishedSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(false);
    n.publish();
    expect(spec.isSatisfiedBy(n)).toBe(true);
  });

  it('DraftSpec matches draft narrative', () => {
    const spec = new DraftSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(true);
    n.publish();
    expect(spec.isSatisfiedBy(n)).toBe(false);
  });

  it('CompletedSpec matches completed narrative', () => {
    const spec = new CompletedSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(false);
    n.updateProfile(n.profile.withStatus(new NarrativeStatus('completed')));
    expect(spec.isSatisfiedBy(n)).toBe(true);
  });

  it('InProgressSpec matches in-progress narrative', () => {
    const spec = new InProgressSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(true);
    n.publish();
    expect(spec.isSatisfiedBy(n)).toBe(false);
    n.updateProfile(n.profile.withStatus(new NarrativeStatus('completed')));
    expect(spec.isSatisfiedBy(n)).toBe(false);
    n.archive();
    expect(spec.isSatisfiedBy(n)).toBe(false);
  });

  it('NovelSpec matches novel format', () => {
    const spec = new NovelSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(true);
  });

  it('NovelSpec does not match screenplay', () => {
    const spec = new NovelSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'screenplay');
    expect(spec.isSatisfiedBy(n)).toBe(false);
  });

  it('ComicSpec matches comic and manga', () => {
    const spec = new ComicSpec();
    const comic = new NarrativeAggregate(new NarrativeIdentity('1'));
    comic.initialize('Test', 'comic');
    expect(spec.isSatisfiedBy(comic)).toBe(true);
    const manga = new NarrativeAggregate(new NarrativeIdentity('2'));
    manga.initialize('Test', 'manga');
    expect(spec.isSatisfiedBy(manga)).toBe(true);
    const novel = new NarrativeAggregate(new NarrativeIdentity('3'));
    novel.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(novel)).toBe(false);
  });

  it('ScreenplaySpec matches screenplay and tvSeries', () => {
    const spec = new ScreenplaySpec();
    const sp = new NarrativeAggregate(new NarrativeIdentity('1'));
    sp.initialize('Test', 'screenplay');
    expect(spec.isSatisfiedBy(sp)).toBe(true);
    const tv = new NarrativeAggregate(new NarrativeIdentity('2'));
    tv.initialize('Test', 'tvSeries');
    expect(spec.isSatisfiedBy(tv)).toBe(true);
  });

  it('InteractiveSpec matches interactive formats', () => {
    const spec = new InteractiveSpec();
    const if_ = new NarrativeAggregate(new NarrativeIdentity('1'));
    if_.initialize('Test', 'interactiveFiction');
    expect(spec.isSatisfiedBy(if_)).toBe(true);
    const vn = new NarrativeAggregate(new NarrativeIdentity('2'));
    vn.initialize('Test', 'visualNovel');
    expect(spec.isSatisfiedBy(vn)).toBe(true);
    const rpg = new NarrativeAggregate(new NarrativeIdentity('3'));
    rpg.initialize('Test', 'rpgCampaign');
    expect(spec.isSatisfiedBy(rpg)).toBe(true);
    const novel = new NarrativeAggregate(new NarrativeIdentity('4'));
    novel.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(novel)).toBe(false);
  });

  it('SeriesSpec matches non-standalone narrative', () => {
    const spec = new SeriesSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(false);
  });

  it('StandaloneSpec matches standalone narrative', () => {
    const spec = new StandaloneSpec();
    const n = new NarrativeAggregate(new NarrativeIdentity('1'));
    n.initialize('Test', 'novel');
    expect(spec.isSatisfiedBy(n)).toBe(true);
  });
});
