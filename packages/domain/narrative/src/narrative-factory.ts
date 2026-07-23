import { Factory, FactoryError } from '@storynaram/domain-kernel';
import { NarrativeAggregate } from './narrative-aggregate.js';
import { NarrativeIdentity } from './narrative-identity.js';
import { NarrativeFormat } from './narrative-profile.js';
import { BeatType } from './narrative-beat.js';
import { SceneType } from './narrative-scene.js';

export interface CreateChapterInput {
  chapterId?: string;
  title: string;
  chapterNumber: number;
  summary?: string;
}

export interface CreateSceneInput {
  sceneId?: string;
  chapterId: string;
  sceneNumber: number;
  title?: string;
  sceneType?: SceneType;
}

export interface CreateBeatInput {
  beatId?: string;
  sceneId: string;
  beatNumber: number;
  beatType: BeatType;
  content?: string;
}

export interface CreateDialogueInput {
  dialogueId?: string;
  beatId: string;
  order: number;
  speaker: string;
  content: string;
  target?: string;
}

export interface CreateNarrativeProps {
  identity?: string;
  title: string;
  format?: NarrativeFormat;
  initialChapters?: CreateChapterInput[];
  initialScenes?: CreateSceneInput[];
  initialBeats?: CreateBeatInput[];
  initialDialogues?: CreateDialogueInput[];
}

export class NarrativeFactory extends Factory<NarrativeAggregate, CreateNarrativeProps> {
  create(props: CreateNarrativeProps): NarrativeAggregate {
    this.assertValid(props.title.length > 0, 'Narrative title is required');

    const identity = props.identity
      ? new NarrativeIdentity(props.identity)
      : NarrativeIdentity.create();

    const narrative = new NarrativeAggregate(identity);
    narrative.initialize(props.title, props.format);

    if (props.initialChapters) {
      for (const ch of props.initialChapters) {
        narrative.addChapter(
          ch.chapterId ?? `ch-${crypto.randomUUID()}`,
          ch.title,
          ch.chapterNumber,
          ch.summary,
        );
      }
    }

    if (props.initialScenes) {
      for (const sc of props.initialScenes) {
        narrative.addScene(
          sc.sceneId ?? `sc-${crypto.randomUUID()}`,
          sc.chapterId,
          sc.sceneNumber,
          sc.title,
          sc.sceneType,
        );
      }
    }

    if (props.initialBeats) {
      for (const bt of props.initialBeats) {
        narrative.addBeat(
          bt.beatId ?? `bt-${crypto.randomUUID()}`,
          bt.sceneId,
          bt.beatNumber,
          bt.beatType,
          bt.content,
        );
      }
    }

    if (props.initialDialogues) {
      for (const dg of props.initialDialogues) {
        narrative.addDialogue(
          dg.dialogueId ?? `dg-${crypto.randomUUID()}`,
          dg.beatId,
          dg.order,
          dg.speaker,
          dg.content,
          dg.target,
        );
      }
    }

    return narrative;
  }

  reconstitute(state: Record<string, unknown>): NarrativeAggregate {
    const identity = new NarrativeIdentity(state.identity as string);
    const narrative = new NarrativeAggregate(identity);
    narrative.initialize(
      (state.profile as Record<string, unknown>)?.title as string ?? 'Untitled',
    );
    return narrative;
  }
}
