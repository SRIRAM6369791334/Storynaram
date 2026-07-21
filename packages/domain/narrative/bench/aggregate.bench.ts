import { bench, describe } from 'vitest';
import { NarrativeAggregate } from '../src/narrative-aggregate';
import { NarrativeIdentity } from '../src/narrative-identity';

describe('NarrativeAggregate benchmarks', () => {
  const narrative = new NarrativeAggregate(NarrativeIdentity.create());
  narrative.initialize('Bench Narrative', 'novel');
  for (let i = 0; i < 10; i++) {
    narrative.addChapter(`ch-${i}`, `Chapter ${i + 1}`, i + 1);
    narrative.addScene(`sc-${i}`, `ch-${i}`, 1, `Scene ${i + 1}`);
    narrative.addBeat(`bt-${i}`, `sc-${i}`, 1, 'setup');
    narrative.addDialogue(`dg-${i}`, `bt-${i}`, 1, 'Narrator', 'Content');
  }

  bench('add 10 chapters sequentially', () => {
    const n = new NarrativeAggregate(NarrativeIdentity.create());
    n.initialize('Bench', 'novel');
    for (let i = 0; i < 10; i++) {
      n.addChapter(`ch-${i}`, `Chapter ${i + 1}`, i + 1);
    }
  });

  bench('scenes of chapter', () => {
    narrative.scenesOfChapter('ch-0');
  });

  bench('beats of scene', () => {
    narrative.beatsOfScene('sc-0');
  });

  bench('dialogues of beat', () => {
    narrative.dialoguesOfBeat('bt-0');
  });

  bench('serialize to JSON', () => {
    narrative.toJSON();
  });
});
