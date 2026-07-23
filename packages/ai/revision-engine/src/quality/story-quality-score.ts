import { CharacterScore } from './character-score.js';
import { WorldScore } from './world-score.js';
import { TimelineScore } from './timeline-score.js';
import { CanonScore } from './canon-score.js';
import { NarrativeScore } from './narrative-score.js';
import { DialogueScore } from './dialogue-score.js';
import { ReadabilityScore } from './readability-score.js';
import { EmotionScore } from './emotion-score.js';
import { ConsistencyScore } from './consistency-score.js';

export interface QualityScores {
  overall: number;
  character: number;
  world: number;
  timeline: number;
  canon: number;
  narrative: number;
  dialogue: number;
  readability: number;
  emotion: number;
  consistency: number;
}

const WEIGHTS = {
  character: 0.15,
  world: 0.10,
  timeline: 0.10,
  canon: 0.15,
  narrative: 0.15,
  dialogue: 0.10,
  readability: 0.10,
  emotion: 0.05,
  consistency: 0.10,
};

export interface StoryQualityScoreParams {
  character: Parameters<CharacterScore['calculate']>[0];
  world: Parameters<WorldScore['calculate']>[0];
  timeline: Parameters<TimelineScore['calculate']>[0];
  canon: Parameters<CanonScore['calculate']>[0];
  narrative: Parameters<NarrativeScore['calculate']>[0];
  dialogue: Parameters<DialogueScore['calculate']>[0];
  readability: Parameters<ReadabilityScore['calculate']>[0];
  emotion: Parameters<EmotionScore['calculate']>[0];
  consistency: Parameters<ConsistencyScore['calculate']>[0];
}

export class StoryQualityScore {
  private characterScore = new CharacterScore();
  private worldScore = new WorldScore();
  private timelineScore = new TimelineScore();
  private canonScore = new CanonScore();
  private narrativeScore = new NarrativeScore();
  private dialogueScore = new DialogueScore();
  private readabilityScore = new ReadabilityScore();
  private emotionScore = new EmotionScore();
  private consistencyScore = new ConsistencyScore();

  calculate(params: StoryQualityScoreParams): QualityScores {
    const scores: QualityScores = {
      character: this.characterScore.calculate(params.character),
      world: this.worldScore.calculate(params.world),
      timeline: this.timelineScore.calculate(params.timeline),
      canon: this.canonScore.calculate(params.canon),
      narrative: this.narrativeScore.calculate(params.narrative),
      dialogue: this.dialogueScore.calculate(params.dialogue),
      readability: this.readabilityScore.calculate(params.readability),
      emotion: this.emotionScore.calculate(params.emotion),
      consistency: this.consistencyScore.calculate(params.consistency),
      overall: 0,
    };

    scores.overall = Math.round(
      scores.character * WEIGHTS.character +
      scores.world * WEIGHTS.world +
      scores.timeline * WEIGHTS.timeline +
      scores.canon * WEIGHTS.canon +
      scores.narrative * WEIGHTS.narrative +
      scores.dialogue * WEIGHTS.dialogue +
      scores.readability * WEIGHTS.readability +
      scores.emotion * WEIGHTS.emotion +
      scores.consistency * WEIGHTS.consistency
    );

    return scores;
  }
}
