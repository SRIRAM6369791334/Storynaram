import { Injectable, Logger } from '@nestjs/common';
import { RedisConnection } from './redis-connection';
import type { RedisConnectionOptions } from '../types';
import { ConnectionError } from '../errors';

@Injectable()
export class ConnectionPool {
  private readonly logger = new Logger(ConnectionPool.name);
  private connections = new Map<string, RedisConnection>();
  private defaultConnection: RedisConnection | null = null;
  private maxConnections: number;

  constructor(maxConnections = 10) {
    this.maxConnections = maxConnections;
  }

  async addConnection(name: string, options: RedisConnectionOptions): Promise<RedisConnection> {
    if (this.connections.size >= this.maxConnections) {
      throw new ConnectionError(`Max connections (${this.maxConnections}) reached`);
    }

    if (this.connections.has(name)) {
      throw new ConnectionError(`Connection "${name}" already exists`);
    }

    const conn = new RedisConnection();
    await conn.initialize(options);
    this.connections.set(name, conn);
    this.logger.log(`Connection pool: added "${name}"`);
    return conn;
  }

  async setDefault(options: RedisConnectionOptions): Promise<RedisConnection> {
    if (this.defaultConnection) {
      await this.defaultConnection.close();
    }
    const conn = new RedisConnection();
    await conn.initialize(options);
    this.defaultConnection = conn;
    this.logger.log('Connection pool: default connection set');
    return conn;
  }

  getConnection(name?: string): RedisConnection {
    if (name) {
      const conn = this.connections.get(name);
      if (!conn) {
        throw new ConnectionError(`Connection "${name}" not found`);
      }
      return conn;
    }
    if (!this.defaultConnection) {
      throw new ConnectionError('No default connection configured');
    }
    return this.defaultConnection;
  }

  async removeConnection(name: string): Promise<void> {
    const conn = this.connections.get(name);
    if (conn) {
      await conn.close();
      this.connections.delete(name);
      this.logger.log(`Connection pool: removed "${name}"`);
    }
  }

  async closeAll(): Promise<void> {
    if (this.defaultConnection) {
      await this.defaultConnection.close();
      this.defaultConnection = null;
    }
    for (const [name, conn] of this.connections) {
      await conn.close();
      this.logger.log(`Connection pool: closed "${name}"`);
    }
    this.connections.clear();
  }

  getActiveCount(): number {
    let count = 0;
    if (this.defaultConnection?.isConnected()) count++;
    for (const conn of this.connections.values()) {
      if (conn.isConnected()) count++;
    }
    return count;
  }

  size(): number {
    let count = 0;
    if (this.defaultConnection) count++;
    return count + this.connections.size;
  }
}
