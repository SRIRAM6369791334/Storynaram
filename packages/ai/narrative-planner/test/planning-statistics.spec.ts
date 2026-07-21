import { describe, it, expect } from 'vitest';
import { PlanningStatistics } from '../src/planning-statistics';

describe('PlanningStatistics', () => {
  it('starts with zero counts', () => {
    const stats = new PlanningStatistics();
    const summary = stats.getSummary();
    expect(summary.totalSessions).toBe(0);
    expect(summary.successRate).toBe(0);
  });

  it('tracks session lifecycle', () => {
    const stats = new PlanningStatistics();
    stats.recordSessionStarted();
    stats.recordSessionCompleted(1000, 5);
    const summary = stats.getSummary();
    expect(summary.totalSessions).toBe(1);
    expect(summary.completedSessions).toBe(1);
    expect(summary.averageDurationMs).toBe(1000);
    expect(summary.averageStagesPerSession).toBe(5);
  });

  it('tracks failures', () => {
    const stats = new PlanningStatistics();
    stats.recordSessionStarted();
    stats.recordSessionFailed();
    const summary = stats.getSummary();
    expect(summary.failedSessions).toBe(1);
    expect(summary.successRate).toBe(0);
  });

  it('tracks cancellations', () => {
    const stats = new PlanningStatistics();
    stats.recordSessionStarted();
    stats.recordSessionCancelled();
    const summary = stats.getSummary();
    expect(summary.cancelledSessions).toBe(1);
  });

  it('records stage timings', () => {
    const stats = new PlanningStatistics();
    stats.recordStageTiming('idea-analysis', 100);
    stats.recordStageTiming('idea-analysis', 200);
    stats.recordStageTiming('character-planning', 150);
    const timings = stats.getStageTimings();
    expect(timings).toHaveLength(2);
    const ideaTiming = timings.find(t => t.stage === 'idea-analysis')!;
    expect(ideaTiming.count).toBe(2);
    expect(ideaTiming.avgMs).toBe(150);
    expect(ideaTiming.minMs).toBe(100);
    expect(ideaTiming.maxMs).toBe(200);
  });

  it('computes correct success rate', () => {
    const stats = new PlanningStatistics();
    stats.recordSessionStarted();
    stats.recordSessionStarted();
    stats.recordSessionCompleted(500, 3);
    stats.recordSessionCompleted(1000, 5);
    const summary = stats.getSummary();
    expect(summary.totalSessions).toBe(2);
    expect(summary.successRate).toBe(100);
  });

  it('resets all data', () => {
    const stats = new PlanningStatistics();
    stats.recordSessionStarted();
    stats.recordSessionCompleted(100, 2);
    stats.reset();
    const summary = stats.getSummary();
    expect(summary.totalSessions).toBe(0);
  });
});
