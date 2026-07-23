import { RevisionAgent, type RevisionAgentResult } from './revision-agent.js';
import type { RevisionPassType } from '../types/revision-context.js';
import type { IssueReport } from '../types/revision-report.js';

export class WorldReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'world';
  readonly name = 'World Consistency Review';

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const worldNames = context.worldNames as string[] ?? [];
    const details: string[] = [];

    const magicPattern = /\b(magic|spell|enchant|wizard|sorcer|arcane|mystical)\b/gi;
    const techPattern = /\b(technology|machine|robot|cyber|digital|quantum|laser)\b/gi;
    const environmentPattern = /\b(forest|mountain|river|ocean|desert|city|village|temple|castle|cave)\b/gi;
    const locationPattern = /\b(kingdom|realm|region|district|province|capital|fortress|harbor|square)\b/gi;

    const magicCount = (content.match(magicPattern) ?? []).length;
    const techCount = (content.match(techPattern) ?? []).length;
    const environmentCount = (content.match(environmentPattern) ?? []).length;
    const locationCount = (content.match(locationPattern) ?? []).length;

    const worldMagic = context.worldMagic as string ?? '';
    const worldTech = context.worldTech as string ?? '';

    if (worldMagic === 'low' && magicCount > 5) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'world-inconsistency',
        severity: 'high',
        chapterNumber,
        description: `Low-magic world but found ${magicCount} magic references.`,
        suggestion: 'Reduce magic references or reconsider the world magic level.',
        resolved: false,
      });
    }

    if (worldTech === 'low' && techCount > 5) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'world-inconsistency',
        severity: 'high',
        chapterNumber,
        description: `Low-technology world but found ${techCount} technology references.`,
        suggestion: 'Reduce technology references or reconsider the world tech level.',
        resolved: false,
      });
    }

    if (worldNames.length > 0) {
      for (const worldName of worldNames) {
        const escapedName = worldName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = new RegExp(escapedName, 'i');
        if (!pattern.test(content)) {
          issues.push({
            id: crypto.randomUUID(),
            type: 'missing-world',
            severity: 'low',
            chapterNumber,
            description: `World "${worldName}" is not mentioned in this chapter.`,
            suggestion: `Consider referencing "${worldName}" for worldbuilding consistency.`,
            resolved: false,
          });
        }
      }
    }

    if (locationCount === 0 && environmentCount === 0) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'missing-location',
        severity: 'low',
        chapterNumber,
        description: 'No locations or environments are described.',
        suggestion: 'Add some environmental description to ground the scene.',
        resolved: false,
      });
    }

    if (issues.length > 0) details.push(`Found ${issues.length} world issue(s)`);
    else details.push('World consistency verified');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }
}
