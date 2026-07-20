import { describe, it, expect } from 'vitest';
import { AuditTrail, AuditEntry, AuditAction } from '../src/audit-trail';
import { Timestamp } from '../src/timestamp';

describe('AuditTrail', () => {
  it('records an entry', () => {
    const audit = new AuditTrail();
    const entry = new AuditEntry(
      '1',
      'User',
      AuditAction.CREATE,
      'admin',
      Timestamp.now(),
      1,
    );
    audit.record(entry);
    expect(audit.getEntries()).toHaveLength(1);
    expect(audit.getEntries()[0].entityId).toBe('1');
  });

  it('records multiple entries', () => {
    const audit = new AuditTrail();
    audit.record(new AuditEntry('1', 'User', AuditAction.CREATE, 'admin', Timestamp.now(), 1));
    audit.record(new AuditEntry('1', 'User', AuditAction.UPDATE, 'admin', Timestamp.now(), 2));
    expect(audit.getEntries()).toHaveLength(2);
  });

  it('clear removes all entries', () => {
    const audit = new AuditTrail();
    audit.record(new AuditEntry('1', 'User', AuditAction.CREATE, 'admin', Timestamp.now(), 1));
    audit.clear();
    expect(audit.getEntries()).toHaveLength(0);
  });

  it('entries are immutable copies', () => {
    const audit = new AuditTrail();
    audit.record(new AuditEntry('1', 'User', AuditAction.CREATE, 'admin', Timestamp.now(), 1));
    const entries = audit.getEntries();
    expect(entries).toHaveLength(1);
    audit.clear();
    expect(entries).toHaveLength(1);
  });
});

describe('AuditEntry', () => {
  it('toJSON returns correct shape', () => {
    const ts = Timestamp.now();
    const entry = new AuditEntry(
      '42',
      'Order',
      AuditAction.UPDATE,
      'user1',
      ts,
      3,
      { status: 'shipped' },
    );
    const json = entry.toJSON();
    expect(json.entityId).toBe('42');
    expect(json.action).toBe('UPDATE');
    expect(json.changes).toEqual({ status: 'shipped' });
  });

  it('handles delete action', () => {
    const entry = new AuditEntry('1', 'Item', AuditAction.DELETE, 'admin', Timestamp.now(), 5);
    expect(entry.action).toBe(AuditAction.DELETE);
  });
});
