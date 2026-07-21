import { describe, it, expect } from 'vitest';
import { SearchService } from '../../src/modules/search/search.service';

describe('SearchService', () => {
  const service = new SearchService();

  it('should index and search documents', async () => {
    await service.index({ id: '1', type: 'story', title: 'The Great Adventure', content: 'A hero goes on a quest', tags: ['fantasy'] });
    await service.index({ id: '2', type: 'character', title: 'Hero', content: 'The main character', tags: ['protagonist'] });

    const results = await service.search('hero');
    expect(results.total).toBeGreaterThanOrEqual(1);
  });

  it('should search by type', async () => {
    const results = await service.search('adventure', 'story');
    expect(results.items.every(i => i.type === 'story')).toBe(true);
  });

  it('should paginate results', async () => {
    const results = await service.search('', undefined, 1, 1);
    expect(results.items.length).toBeLessThanOrEqual(1);
  });
});
