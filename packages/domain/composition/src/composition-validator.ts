import { BusinessRuleViolation } from '@storynaram/domain-kernel';
import { StoryAggregate } from './story-aggregate.js';
import { ThreeActStructureRule, FiveActStructureRule, ConflictConsistencyRule, ForeshadowPayoffValidationRule, ArcConsistencyRule, CharacterObjectiveConsistencyRule, ThemeConsistencyRule, TimelineConsistencyRule, CanonConsistencyRule, NarrativeConsistencyRule } from './business-rules.js';

export class CompositionValidator {
  validate(story: StoryAggregate): BusinessRuleViolation[] {
    const violations: BusinessRuleViolation[] = [];

    const threeAct = new ThreeActStructureRule(story.plot.structure, story.plot.points.count);
    const result = threeAct.check();
    if (result) violations.push(result);

    const fiveAct = new FiveActStructureRule(story.plot.structure, story.plot.points.count);
    const result2 = fiveAct.check();
    if (result2) violations.push(result2);

    for (const conflict of story.conflicts.all) {
      const conflictRule = new ConflictConsistencyRule(conflict.category, conflict.parties.length >= 2);
      const result3 = conflictRule.check();
      if (result3) violations.push(result3);
    }

    const fps = new ForeshadowPayoffValidationRule(story.foreshadows.count, story.payoffs.count);
    const result4 = fps.check();
    if (result4) violations.push(result4);

    for (const arc of story.arcs.all) {
      const arcRule = new ArcConsistencyRule(arc.name, arc.goal.description.length > 0, arc.resolution.description.length > 0);
      const result5 = arcRule.check();
      if (result5) violations.push(result5);
    }

    const themeRule = new ThemeConsistencyRule(story.themes.count);
    const result6 = themeRule.check();
    if (result6) violations.push(result6);

    const timelineRule = new TimelineConsistencyRule(story.metadata.sourceTimelineIds.length > 0);
    const result7 = timelineRule.check();
    if (result7) violations.push(result7);

    const canonRule = new CanonConsistencyRule(story.metadata.sourceCanonIds.length > 0);
    const result8 = canonRule.check();
    if (result8) violations.push(result8);

    const narrativeRule = new NarrativeConsistencyRule(story.metadata.sourceNarrativeId.length > 0);
    const result9 = narrativeRule.check();
    if (result9) violations.push(result9);

    return violations;
  }
}
