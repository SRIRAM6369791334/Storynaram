import { BusinessRuleViolation } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate';
import { StoryIdentity } from './story-identity';
import { CompositionValidator } from './composition-validator';
import { CompositionAnalyzer, AnalysisReport } from './composition-analyzer';
import { CompositionStatistics } from './composition-statistics';

export interface CompositionResult {
  storyId: string;
  valid: boolean;
  violations: BusinessRuleViolation[];
  report: AnalysisReport;
}

export class CompositionEngine {
  private readonly validator: CompositionValidator;
  private readonly analyzer: CompositionAnalyzer;
  private _statistics: CompositionStatistics;

  constructor() {
    this.validator = new CompositionValidator();
    this.analyzer = new CompositionAnalyzer();
    this._statistics = new CompositionStatistics();
  }

  get statistics(): CompositionStatistics {
    return this._statistics;
  }

  analyze(story: StoryAggregate): CompositionResult {
    const violations = this.validator.validate(story);
    const report = this.analyzer.analyze(story);

    this._statistics = this._statistics.recordAnalysis(violations.length, report);

    return {
      storyId: story.identity.value,
      valid: violations.length === 0,
      violations,
      report,
    };
  }

  generateOutline(story: StoryAggregate): string {
    const lines: string[] = [];
    lines.push(`# ${story.profile.title}`);
    lines.push(`Format: ${story.profile.format}`);
    lines.push(`Structure: ${story.plot.structure}`);
    lines.push('');
    lines.push('## Plot Points');
    for (const point of story.plot.points.sorted()) {
      lines.push(`- [${point.stage}] ${point.title || 'Untitled'} (Ch. ${point.chapterId})`);
    }
    lines.push('');
    lines.push('## Arcs');
    for (const arc of story.arcs.all) {
      lines.push(`- ${arc.name} [${arc.stage}]`);
    }
    lines.push('');
    lines.push('## Conflicts');
    for (const conflict of story.conflicts.all) {
      lines.push(`- ${conflict.category}: ${conflict.description || 'Unnamed'} [${conflict.state}]`);
    }
    lines.push('');
    lines.push('## Themes');
    for (const theme of story.themes.all) {
      lines.push(`- ${theme.category}: ${theme.statement}`);
    }
    return lines.join('\n');
  }

  generateCompositionGraph(story: StoryAggregate): Record<string, unknown> {
    return {
      nodes: story.plot.points.all.map(p => ({
        id: p.pointId, type: 'plotPoint', stage: p.stage,
        connections: p.conflictIds,
      })),
      arcs: story.arcs.all.map(a => ({
        id: a.arcId, name: a.name, stage: a.stage,
        characterIds: [...a.characterIds], plotPointIds: [...a.plotPointIds],
      })),
      conflicts: story.conflicts.all.map(c => ({
        id: c.conflictId, category: c.category, state: c.state,
        parties: [...c.parties],
      })),
      edges: this.buildEdges(story),
    };
  }

  private buildEdges(story: StoryAggregate): Array<{ source: string; target: string; type: string }> {
    const edges: Array<{ source: string; target: string; type: string }> = [];
    for (const conflict of story.conflicts.all) {
      for (const plotPointId of conflict.relatedPlotPointIds) {
        edges.push({ source: conflict.conflictId, target: plotPointId, type: 'conflicts-with' });
      }
      for (const arcId of conflict.relatedArcIds) {
        edges.push({ source: conflict.conflictId, target: arcId, type: 'conflicts-in' });
      }
    }
    for (const arc of story.arcs.all) {
      for (const plotPointId of arc.plotPointIds) {
        edges.push({ source: arc.arcId, target: plotPointId, type: 'arc-contains' });
      }
    }
    return edges;
  }
}
