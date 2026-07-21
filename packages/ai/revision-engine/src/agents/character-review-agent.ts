import { RevisionAgent, type RevisionAgentResult } from './revision-agent';
import type { RevisionPassType } from '../types/revision-context';
import type { IssueReport } from '../types/revision-report';

export class CharacterReviewAgent extends RevisionAgent {
  readonly passType: RevisionPassType = 'character';
  readonly name = 'Character Consistency Review';

  execute(content: string, chapterNumber: number, context: Record<string, unknown>): RevisionAgentResult {
    const issues: IssueReport[] = [];
    const details: string[] = [];
    const expectedCharacters = context.expectedCharacters as string[] ?? [];
    const characterTraits = context.characterTraits as Record<string, string[]> ?? {};

    for (const character of expectedCharacters) {
      const escapedName = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const namePattern = new RegExp(escapedName, 'gi');
      const mentions = content.match(namePattern);

      if (!mentions || mentions.length === 0) {
        issues.push({
          id: crypto.randomUUID(),
          type: 'missing-character',
          severity: 'high',
          chapterNumber,
          description: `Character "${character}" should appear but is not found.`,
          suggestion: `Add "${character}" to this chapter or explain their absence.`,
          resolved: false,
        });
      }
    }

    for (const [character, traits] of Object.entries(characterTraits)) {
      const escapedName = character.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const namePattern = new RegExp(escapedName, 'gi');
      if (!namePattern.test(content)) continue;

      for (const trait of traits) {
        if (trait === 'brave') this.checkBraveConsistency(content, character, issues, chapterNumber);
        if (trait === 'kind') this.checkKindConsistency(content, character, issues, chapterNumber);
      }
    }

    if (issues.length > 0) details.push(`Found ${issues.length} character issue(s)`);
    else details.push('Character consistency verified');

    return {
      passType: this.passType,
      passed: issues.length === 0,
      issuesFound: issues,
      issuesResolved: 0,
      details,
    };
  }

  private checkBraveConsistency(content: string, character: string, issues: IssueReport[], chapterNumber: number): void {
    const cowardPattern = new RegExp(`${character}[\\w\\s,']*(?:cowered|fled|ran away|hid|trembled|feared|cowardly)`, 'gi');
    if (cowardPattern.test(content)) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'character-inconsistency',
        severity: 'medium',
        chapterNumber,
        description: `"${character}" is described as brave but shows cowardly behavior.`,
        suggestion: 'Either adjust the characterization or add context for the behavior.',
        resolved: false,
      });
    }
  }

  private checkKindConsistency(content: string, character: string, issues: IssueReport[], chapterNumber: number): void {
    const cruelPattern = new RegExp(`${character}[\\w\\s,']*(?:cruel|harsh|merciless|brutal|vicious)`, 'gi');
    if (cruelPattern.test(content)) {
      issues.push({
        id: crypto.randomUUID(),
        type: 'character-inconsistency',
        severity: 'medium',
        chapterNumber,
        description: `"${character}" is described as kind but shows cruel behavior.`,
        suggestion: 'Either adjust the characterization or add motivation for the behavior.',
        resolved: false,
      });
    }
  }
}
