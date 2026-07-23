import { PlanningSession } from './planning-session.js';
import { PlanningResult } from './planning-result.js';
import { PlanningContext } from './planning-context.js';
import { SessionCheckpoint } from './planning-session.js';

export class PlanningMemory {
  private readonly sessions = new Map<string, PlanningSession>();
  private readonly results = new Map<string, PlanningResult>();
  private readonly contexts = new Map<string, PlanningContext>();
  private readonly checkpoints = new Map<string, SessionCheckpoint>();

  saveSession(session: PlanningSession): void {
    this.sessions.set(session.sessionId, session);
  }

  getSession(sessionId: string): PlanningSession | undefined {
    return this.sessions.get(sessionId);
  }

  getAllSessions(): PlanningSession[] {
    return Array.from(this.sessions.values());
  }

  deleteSession(sessionId: string): boolean {
    this.results.delete(sessionId);
    this.contexts.delete(sessionId);
    return this.sessions.delete(sessionId);
  }

  saveResult(result: PlanningResult): void {
    this.results.set(result.sessionId, result);
  }

  getResult(sessionId: string): PlanningResult | undefined {
    return this.results.get(sessionId);
  }

  getAllResults(): PlanningResult[] {
    return Array.from(this.results.values());
  }

  saveContext(sessionId: string, context: PlanningContext): void {
    this.contexts.set(sessionId, context);
  }

  getContext(sessionId: string): PlanningContext | undefined {
    return this.contexts.get(sessionId);
  }

  saveCheckpoint(checkpoint: SessionCheckpoint): void {
    this.checkpoints.set(checkpoint.id, checkpoint);
  }

  getCheckpoint(checkpointId: string): SessionCheckpoint | undefined {
    return this.checkpoints.get(checkpointId);
  }

  getSessionCheckpoints(sessionId: string): SessionCheckpoint[] {
    return Array.from(this.checkpoints.values())
      .filter(c => c.sessionId === sessionId);
  }

  getActiveSessionCount(): number {
    return Array.from(this.sessions.values())
      .filter(s => s.status === 'running').length;
  }

  getTotalSessionCount(): number {
    return this.sessions.size;
  }

  clear(): void {
    this.sessions.clear();
    this.results.clear();
    this.contexts.clear();
    this.checkpoints.clear();
  }
}
