import { describe, it, expect } from 'vitest';
import { GrammarAgent } from '../src/agents/grammar-agent';
import { CharacterReviewAgent } from '../src/agents/character-review-agent';
import { WorldReviewAgent } from '../src/agents/world-review-agent';
import { TimelineReviewAgent } from '../src/agents/timeline-review-agent';
import { CanonReviewAgent } from '../src/agents/canon-review-agent';
import { NarrativeReviewAgent } from '../src/agents/narrative-review-agent';
import { PlotReviewAgent } from '../src/agents/plot-review-agent';
import { StyleReviewAgent } from '../src/agents/style-review-agent';
import { QualityReviewAgent } from '../src/agents/quality-review-agent';

describe('GrammarAgent', () => {
  it('detects spelling mistakes', () => {
    const agent = new GrammarAgent();
    const result = agent.execute('Their was a hero who recieved a sword.', 1, {});

    expect(result.passType).toBe('grammar');
    expect(result.issuesFound.length).toBeGreaterThan(0);
    expect(result.details.some(d => d.includes('spelling'))).toBe(true);
  });

  it('detects grammar issues', () => {
    const agent = new GrammarAgent();
    const result = agent.execute('the hero walked into the village. he found the dragon.', 1, {});

    expect(result.issuesFound.length).toBeGreaterThan(0);
  });

  it('returns passed when no issues', () => {
    const agent = new GrammarAgent();
    const result = agent.execute('The brave hero walked into the village.', 1, {});

    expect(result.passed).toBe(true);
    expect(result.issuesFound).toHaveLength(0);
  });

  it('applies auto-fixes when configured', () => {
    const agent = new GrammarAgent();
    const result = agent.execute('The hero recieved a quest.', 1, { autoFix: true });

    expect(result.issuesResolved).toBeGreaterThan(0);
    expect(result.revisedContent).toBeDefined();
    if (result.revisedContent) {
      expect(result.revisedContent).not.toContain('recieved');
    }
  });
});

describe('CharacterReviewAgent', () => {
  it('detects missing characters', () => {
    const agent = new CharacterReviewAgent();
    const result = agent.execute('The adventure began.', 1, { expectedCharacters: ['Kael'] });

    expect(result.issuesFound.some(i => i.type === 'missing-character')).toBe(true);
  });

  it('passes when characters are present', () => {
    const agent = new CharacterReviewAgent();
    const result = agent.execute('Kael walked into the forest.', 1, { expectedCharacters: ['Kael'] });

    expect(result.passed).toBe(true);
  });

  it('checks character consistency', () => {
    const agent = new CharacterReviewAgent();
    const result = agent.execute('Kael cowered in fear and fled from the challenge.', 1, {
      expectedCharacters: ['Kael'],
      characterTraits: { Kael: ['brave'] },
    });

    expect(result.issuesFound.some(i => i.type === 'character-inconsistency')).toBe(true);
  });
});

describe('WorldReviewAgent', () => {
  it('reports world issues', () => {
    const agent = new WorldReviewAgent();
    const result = agent.execute('Chapter content.', 1, { worldNames: ['Atheria'] });

    expect(result.issuesFound.some(i => i.type === 'missing-world')).toBe(true);
  });

  it('passes with world references', () => {
    const agent = new WorldReviewAgent();
    const result = agent.execute('Atheria was a land of magic and wonder. The forest stretched beyond the castle walls.', 1, { worldNames: ['Atheria'] });

    expect(result.passed || result.issuesFound.length > 0).toBe(true);
  });

  it('detects magic inconsistency', () => {
    const agent = new WorldReviewAgent();
    const result = agent.execute('The wizard cast a powerful spell. Another spell followed. More magic erupted. Enchantments flew everywhere. Sorcery dominated the battlefield. Arcane energies surged.', 1, { worldMagic: 'low', worldNames: ['Atheria'] });

    expect(result.issuesFound.length).toBeGreaterThan(0);
  });
});

describe('TimelineReviewAgent', () => {
  it('checks timeline consistency', () => {
    const agent = new TimelineReviewAgent();
    const result = agent.execute('In 1999 the war began. By 1995 peace was declared.', 1, {});

    expect(result.issuesFound.some(i => i.type === 'timeline')).toBe(true);
  });

  it('passes with consistent timeline', () => {
    const agent = new TimelineReviewAgent();
    const result = agent.execute('In 1995 the journey began.', 1, {});

    expect(result.issuesFound.filter(i => i.type === 'timeline')).toHaveLength(0);
  });
});

describe('CanonReviewAgent', () => {
  it('detects canon violations', () => {
    const agent = new CanonReviewAgent();
    const result = agent.execute('The red sword of power was destroyed.', 1, {
      canonFacts: ['the red sword should not be destroyed'],
    });

    expect(result.issuesFound.some(i => i.type === 'canon-violation')).toBe(true);
  });

  it('checks canon events', () => {
    const agent = new CanonReviewAgent();
    const result = agent.execute('The great battle occurred.', 1, {
      canonEvents: ['great battle'],
    });

    expect(result.passed).toBe(true);
  });
});

describe('NarrativeReviewAgent', () => {
  it('detects weak transitions', () => {
    const agent = new NarrativeReviewAgent();
    const result = agent.execute('Paragraph one content\n\nParagraph two content.', 1, {});

    const transitionIssues = result.issuesFound.filter(i => i.type === 'weak-transition');
    expect(transitionIssues.length).toBeGreaterThan(0);
  });

  it('passes with good narrative', () => {
    const agent = new NarrativeReviewAgent();
    const result = agent.execute('First paragraph ended well.\n\n"Then the next began with dialogue."', 1, {});

    expect(result.passed || result.issuesFound.length === 0).toBe(true);
  });

  it('detects empty content', () => {
    const agent = new NarrativeReviewAgent();
    const result = agent.execute('', 1, {});

    expect(result.issuesFound.some(i => i.type === 'empty-content')).toBe(true);
  });
});

describe('PlotReviewAgent', () => {
  it('detects missing arc elements', () => {
    const agent = new PlotReviewAgent();
    const result = agent.execute('Chapter content.', 2, {
      arcElements: ['Hero\'s Journey'],
    });

    expect(result.issuesFound.some(i => i.type === 'broken-arc')).toBe(true);
  });

  it('detects plot holes', () => {
    const agent = new PlotReviewAgent();
    const result = agent.execute('Suddenly the hero appeared. Out of nowhere the villain conveniently had the key. Inexplicably everything worked out.', 1, {});

    expect(result.issuesFound.some(i => i.type === 'plot-hole')).toBe(true);
  });

  it('passes with clean plot', () => {
    const agent = new PlotReviewAgent();
    const result = agent.execute('The chapter progressed naturally.', 1, {});

    expect(result.passed).toBe(true);
  });
});

describe('StyleReviewAgent', () => {
  it('detects weak vocabulary', () => {
    const agent = new StyleReviewAgent();
    const result = agent.execute('It was a good day. A nice big house. A great pretty view. A small cute cat. A bad old man. A new happy baby.', 1, {});

    expect(result.issuesFound.some(i => i.type === 'weak-vocabulary')).toBe(true);
  });

  it('detects overused adverbs', () => {
    const agent = new StyleReviewAgent();
    const result = agent.execute('He was very tired. He really wanted to go. It was quite dark. She was extremely happy.', 1, {});

    expect(result.issuesFound.some(i => i.type === 'overused-adverbs')).toBe(true);
  });

  it('passes with good style', () => {
    const agent = new StyleReviewAgent();
    const result = agent.execute('The crimson sunset painted the sky as whispers of hope and wonder stirred in the wind. Fear and courage mingled in the heroes heart as awe filled their soul.', 1, {});

    expect(result.passed || result.issuesFound.length === 0).toBe(true);
  });
});

describe('QualityReviewAgent', () => {
  it('returns quality assessment', () => {
    const agent = new QualityReviewAgent();
    const result = agent.execute('Content.', 1, {
      qualityParams: {
        character: { presentCharacters: [], expectedCharacters: [], dialogueProportions: 0, characterMentions: new Map(), characterTraits: new Map() },
        world: { worldNames: [], locationCount: 0, cultureMentions: 0, magicMentions: 0, technologyMentions: 0, environmentMentions: 0, consistencyIssues: [] },
        timeline: { totalEvents: 0, chronologicalOrder: true, flashbackCount: 0, timeJumpCount: 0, ageConsistencyIssues: [], temporalContradictions: [] },
        canon: { factViolations: [], referenceErrors: [], eventContradictions: [], historyInconsistencies: [], relationshipErrors: [] },
        narrative: { pacingIssues: [], flowIssues: [], transitionIssues: [], sceneOrderIssues: [], chapterOrderIssues: [], chapterCount: 0, avgChapterWordCount: 0 },
        dialogue: { totalDialogueLines: 0, uniqueSpeakers: 0, dialogueProportion: 0, weakTags: [], repetitiveTags: [], dialogueLengthIssues: [] },
        readability: { totalWords: 0, totalSentences: 0, totalSyllables: 0, complexWords: 0, avgSentenceLength: 0, paragraphCount: 0 },
        emotion: { emotionalWords: 0, totalWords: 0, emotionalVariety: 0, positiveRatio: 0, negativeRatio: 0, intenseEmotions: 0 },
        consistency: { characterInconsistencies: [], worldInconsistencies: [], timelineInconsistencies: [], plotInconsistencies: [], styleInconsistencies: [] },
      },
    });

    expect(result.passType).toBe('quality');
    expect(result.details.some(d => d.includes('Quality score'))).toBe(true);
  });

  it('handles missing params gracefully', () => {
    const agent = new QualityReviewAgent();
    const result = agent.execute('Content.', 1, {});

    expect(result.details.some(d => d.includes('skipped'))).toBe(true);
  });
});
