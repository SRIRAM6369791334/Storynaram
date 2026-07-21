import { bench, describe } from 'vitest';
import { GrammarAgent } from '../src/agents/grammar-agent';
import { CharacterReviewAgent } from '../src/agents/character-review-agent';
import { WorldReviewAgent } from '../src/agents/world-review-agent';
import { StyleReviewAgent } from '../src/agents/style-review-agent';
import { PlotReviewAgent } from '../src/agents/plot-review-agent';
import { ImprovementApplier } from '../src/improvement/improvement-applier';

const grammarAgent = new GrammarAgent();
const characterAgent = new CharacterReviewAgent();
const worldAgent = new WorldReviewAgent();
const styleAgent = new StyleReviewAgent();
const plotAgent = new PlotReviewAgent();
const applier = new ImprovementApplier();

const chapterContent = 'Once upon a time their was a brave hero named Kael who lived in a small village. He recieved a quest from the king and definately accepted it. The journey would be long and dangerous. Kael gathered his supplies and said goodbye to his family. The villagers cheered as he departed.';

describe('Revision Throughput', () => {
  bench('grammar agent execution', () => {
    grammarAgent.execute(chapterContent, 1, {});
  });

  bench('character agent execution', () => {
    characterAgent.execute(chapterContent, 1, { expectedCharacters: ['Kael', 'King'], characterTraits: { Kael: ['brave'] } });
  });

  bench('world agent execution', () => {
    worldAgent.execute(chapterContent, 1, { worldNames: ['Atheria'] });
  });

  bench('style agent execution', () => {
    styleAgent.execute(chapterContent, 1, {});
  });

  bench('plot agent execution', () => {
    plotAgent.execute(chapterContent, 1, {});
  });

  bench('auto fix application', () => {
    applier.applyAutoFixAll(chapterContent);
  });

  bench('diff generation', () => {
    applier.generateDiff(chapterContent, chapterContent.replace('their', 'there'));
  });
});
