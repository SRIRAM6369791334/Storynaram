import { StoryAggregate } from './story-aggregate.js';

export interface AnalysisReport {
  totalPlotPoints: number;
  totalArcs: number;
  totalConflicts: number;
  totalThemes: number;
  totalForeshadows: number;
  totalPayoffs: number;
  unresolvedConflicts: number;
  incompleteArcs: number;
  unpaidForeshadows: number;
  achievedObjectives: number;
  totalObjectives: number;
  plotProgress: number;
  hasTimelineRefs: boolean;
  hasCanonRefs: boolean;
  hasNarrativeRefs: boolean;
  conflictCategories: Record<string, number>;
  themeCategories: Record<string, number>;
  arcStages: Record<string, number>;
}

export class CompositionAnalyzer {
  analyze(story: StoryAggregate): AnalysisReport {
    const conflictCategories: Record<string, number> = {};
    for (const c of story.conflicts.all) {
      conflictCategories[c.category] = (conflictCategories[c.category] ?? 0) + 1;
    }

    const themeCategories: Record<string, number> = {};
    for (const t of story.themes.all) {
      themeCategories[t.category] = (themeCategories[t.category] ?? 0) + 1;
    }

    const arcStages: Record<string, number> = {};
    for (const a of story.arcs.all) {
      arcStages[a.stage] = (arcStages[a.stage] ?? 0) + 1;
    }

    return {
      totalPlotPoints: story.plot.points.count,
      totalArcs: story.arcs.count,
      totalConflicts: story.conflicts.count,
      totalThemes: story.themes.count,
      totalForeshadows: story.foreshadows.count,
      totalPayoffs: story.payoffs.count,
      unresolvedConflicts: story.conflicts.active().length,
      incompleteArcs: story.arcs.all.filter(a => a.stage !== 'completed').length,
      unpaidForeshadows: story.foreshadows.unpaid().length,
      achievedObjectives: story.objectives.achieved(),
      totalObjectives: story.objectives.totalCount,
      plotProgress: story.plot.points.sorted().length > 0 ? Math.round((story.plot.points.ofStage('resolution').length / Math.max(story.plot.points.count, 1)) * 100) : 0,
      hasTimelineRefs: story.metadata.sourceTimelineIds.length > 0,
      hasCanonRefs: story.metadata.sourceCanonIds.length > 0,
      hasNarrativeRefs: story.metadata.sourceNarrativeId.length > 0,
      conflictCategories,
      themeCategories,
      arcStages,
    };
  }
}
