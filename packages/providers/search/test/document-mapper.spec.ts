import { describe, it, expect } from 'vitest';
import { DocumentMapper } from '../src/document-mapper';

describe('DocumentMapper', () => {
  const mapper = new DocumentMapper();

  it('creates a SearchDocument', () => {
    const doc = mapper.toDocument('idx', '123', { title: 'test' });
    expect(doc.index).toBe('idx');
    expect(doc.id).toBe('123');
    expect(doc.body.title).toBe('test');
  });

  it('converts a SearchHit to SearchDocument', () => {
    const doc = mapper.fromHit({
      id: 'abc', index: 'my-index', score: 1, source: { name: 'foo' },
    });
    expect(doc.index).toBe('my-index');
    expect(doc.id).toBe('abc');
    expect(doc.body.name).toBe('foo');
  });

  it('produces bulk action metadata', () => {
    const doc = { index: 'idx', id: '1', body: { field: 'value' } };
    const [meta, body] = mapper.toBulkAction('index', doc);
    expect(meta).toEqual({ index: { _index: 'idx', _id: '1' } });
    expect(body).toEqual({ field: 'value' });
  });

  it('produces delete action without body', () => {
    const doc = { index: 'idx', id: '1', body: {} };
    const result = mapper.toBulkAction('delete', doc);
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({ delete: { _index: 'idx', _id: '1' } });
  });

  it('extracts fields by dotted path', () => {
    const doc = { index: 'idx', id: '1', body: { user: { name: 'Alice', address: { city: 'NYC' } } } };
    expect(mapper.extractField(doc, 'user.name')).toBe('Alice');
    expect(mapper.extractField(doc, 'user.address.city')).toBe('NYC');
    expect(mapper.extractField(doc, 'missing')).toBeUndefined();
  });

  it('flattens a document', () => {
    const doc = { index: 'idx', id: '1', body: { user: { name: 'Bob' }, age: 30 } };
    const flat = mapper.flatten(doc);
    expect(flat._id).toBe('1');
    expect(flat._index).toBe('idx');
    expect(flat['user.name']).toBe('Bob');
    expect(flat.age).toBe(30);
  });

  it('sanitizes dates and undefined', () => {
    const doc = mapper.toDocument('idx', '1', {
      name: 'test',
      date: new Date('2025-01-01'),
      nested: { value: undefined, num: 42 },
    });
    expect(doc.body.date).toBe('2025-01-01T00:00:00.000Z');
    expect(doc.body.name).toBe('test');
    expect(doc.body.nested).toEqual({ num: 42 });
  });
});
