import { describe, it, expect } from 'vitest';
import {
  ThreeActStructureRule, FiveActStructureRule,
  ConflictConsistencyRule, ForeshadowPayoffValidationRule,
  ArcConsistencyRule, CharacterObjectiveConsistencyRule,
  ThemeConsistencyRule, TimelineConsistencyRule,
  CanonConsistencyRule, NarrativeConsistencyRule,
} from '../src/business-rules';

describe('BusinessRules', () => {
  it('ThreeActStructureRule passes for non-three-act', () => {
    const rule = new ThreeActStructureRule('heroJourney', 0);
    expect(rule.check()).toBeNull();
  });

  it('ThreeActStructureRule warns when under 3 points', () => {
    const rule = new ThreeActStructureRule('threeAct', 1);
    expect(rule.check()).not.toBeNull();
  });

  it('ThreeActStructureRule passes with 3+ points', () => {
    const rule = new ThreeActStructureRule('threeAct', 5);
    expect(rule.check()).toBeNull();
  });

  it('FiveActStructureRule passes for non-five-act', () => {
    const rule = new FiveActStructureRule('threeAct', 0);
    expect(rule.check()).toBeNull();
  });

  it('FiveActStructureRule warns when under 5 points', () => {
    const rule = new FiveActStructureRule('fiveAct', 2);
    expect(rule.check()).not.toBeNull();
  });

  it('ConflictConsistencyRule passes for non-character conflict', () => {
    const rule = new ConflictConsistencyRule('characterVsSelf', true);
    expect(rule.check()).toBeNull();
  });

  it('ConflictConsistencyRule fails for character conflict without parties', () => {
    const rule = new ConflictConsistencyRule('characterVsCharacter', false);
    expect(rule.check()).not.toBeNull();
  });

  it('ConflictConsistencyRule passes for character conflict with parties', () => {
    const rule = new ConflictConsistencyRule('characterVsCharacter', true);
    expect(rule.check()).toBeNull();
  });

  it('ForeshadowPayoffValidationRule passes with no foreshadows', () => {
    const rule = new ForeshadowPayoffValidationRule(0, 0);
    expect(rule.check()).toBeNull();
  });

  it('ForeshadowPayoffValidationRule warns for foreshadows without payoffs', () => {
    const rule = new ForeshadowPayoffValidationRule(5, 0);
    expect(rule.check()).not.toBeNull();
  });

  it('ArcConsistencyRule warns for arcs without goals', () => {
    const rule = new ArcConsistencyRule('Test Arc', false, true);
    expect(rule.check()).not.toBeNull();
  });

  it('ArcConsistencyRule warns for arcs without resolution', () => {
    const rule = new ArcConsistencyRule('Test Arc', true, false);
    expect(rule.check()).not.toBeNull();
  });

  it('ArcConsistencyRule passes for complete arcs', () => {
    const rule = new ArcConsistencyRule('Test Arc', true, true);
    expect(rule.check()).toBeNull();
  });

  it('CharacterObjectiveConsistencyRule warns for no objectives', () => {
    const rule = new CharacterObjectiveConsistencyRule('Hero', 0);
    expect(rule.check()).not.toBeNull();
  });

  it('CharacterObjectiveConsistencyRule passes with objectives', () => {
    const rule = new CharacterObjectiveConsistencyRule('Hero', 3);
    expect(rule.check()).toBeNull();
  });

  it('ThemeConsistencyRule warns for no themes', () => {
    const rule = new ThemeConsistencyRule(0);
    expect(rule.check()).not.toBeNull();
  });

  it('ThemeConsistencyRule passes with themes', () => {
    const rule = new ThemeConsistencyRule(2);
    expect(rule.check()).toBeNull();
  });

  it('TimelineConsistencyRule warns for no timeline refs', () => {
    const rule = new TimelineConsistencyRule(false);
    expect(rule.check()).not.toBeNull();
  });

  it('CanonConsistencyRule warns for no canon refs', () => {
    const rule = new CanonConsistencyRule(false);
    expect(rule.check()).not.toBeNull();
  });

  it('NarrativeConsistencyRule warns for no narrative refs', () => {
    const rule = new NarrativeConsistencyRule(false);
    expect(rule.check()).not.toBeNull();
  });
});
