import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RedisMock from 'ioredis-mock';
import { RedisConnection } from '../src/connection/redis-connection';
import { QueueManager } from '../src/queue/queue-manager';
import { QueueError } from '../src/errors';

vi.mock('ioredis', () => ({
  default: RedisMock,
  Cluster: RedisMock.Cluster,
}));

describe('QueueManager', () => {
  let connection: RedisConnection;
  let queueManager: QueueManager;

  beforeEach(async () => {
    connection = new RedisConnection({});
    await connection.initialize({ host: 'localhost', port: 6379, lazyConnect: true });
    queueManager = new QueueManager(connection, 'test');
  });

  afterEach(async () => {
    await connection.close();
  });

  it('enqueues a message', async () => {
    const id = await queueManager.enqueue('work-queue', { task: 'build' });
    expect(id).toBeTruthy();
    expect(typeof id).toBe('string');
  });

  it('enqueues and dequeues FIFO', async () => {
    await queueManager.enqueue('fifo', 'first');
    await queueManager.enqueue('fifo', 'second');
    const msg1 = await queueManager.dequeue<string>('fifo');
    expect(msg1?.data).toBe('first');
    const msg2 = await queueManager.dequeue<string>('fifo');
    expect(msg2?.data).toBe('second');
  });

  it('dequeue returns null for empty queue', async () => {
    const msg = await queueManager.dequeueNonBlocking('empty-queue');
    expect(msg).toBeNull();
  });

  it('acknowledge removes message from processing', async () => {
    const id = await queueManager.enqueue('ack-queue', 'data');
    await queueManager.dequeue<string>('ack-queue');
    const ackd = await queueManager.acknowledge('ack-queue', id);
    expect(ackd).toBe(true);
  });

  it('nack returns message to queue up to maxRetries', async () => {
    const id = await queueManager.enqueue('nack-queue', 'data', { maxRetries: 2 });
    await queueManager.dequeue('nack-queue');
    await queueManager.nack('nack-queue', id);
    const len = await queueManager.getQueueLength('nack-queue');
    expect(len).toBe(1);
  });

  it('nack moves to DLQ after max retries', async () => {
    const id = await queueManager.enqueue('dlq-queue', 'fail-data', { maxRetries: 1 });
    // first attempt: dequeue and nack
    await queueManager.dequeue('dlq-queue');
    await queueManager.nack('dlq-queue', id);
    // should be back in queue, retryCount=1
    await queueManager.dequeue('dlq-queue');
    await queueManager.nack('dlq-queue', id);
    // should now be in DLQ
    const dlqCount = await queueManager.getDeadLetterCount('dlq-queue');
    expect(dlqCount).toBe(1);
  });

  it('getQueueLength returns queue size', async () => {
    await queueManager.enqueue('len-q', 'a');
    await queueManager.enqueue('len-q', 'b');
    const len = await queueManager.getQueueLength('len-q');
    expect(len).toBe(2);
  });

  it('getProcessingCount returns processing size', async () => {
    await queueManager.enqueue('proc-q', 'item');
    await queueManager.dequeue('proc-q');
    const processing = await queueManager.getProcessingCount('proc-q');
    expect(processing).toBe(1);
  });

  it('peek returns last element without removing', async () => {
    await queueManager.enqueue('peek-q', 'A');
    await queueManager.enqueue('peek-q', 'B');
    const peeked = await queueManager.peek<string>('peek-q');
    expect(peeked?.data).toBe('A');
    const len = await queueManager.getQueueLength('peek-q');
    expect(len).toBe(2);
  });

  it('clear removes all queue data', async () => {
    await queueManager.enqueue('clear-q', 'x');
    await queueManager.dequeue('clear-q');
    await queueManager.clear('clear-q');
    expect(await queueManager.getQueueLength('clear-q')).toBe(0);
    expect(await queueManager.getProcessingCount('clear-q')).toBe(0);
    expect(await queueManager.getDeadLetterCount('clear-q')).toBe(0);
  });
});
