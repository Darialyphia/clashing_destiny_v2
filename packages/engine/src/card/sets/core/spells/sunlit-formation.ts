import dedent from 'dedent';
import { SimpleHealthBuffModifier } from '../../../../modifier/modifiers/simple-health-buff.modifier';
import type { SpellBlueprint } from '../../../card-blueprint';
import { singleAllyMinionTargetRules } from '../../../card-utils';
import {
  SPELL_SCHOOLS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  HERO_JOBS
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import { ProtectorModifier } from '../../../../modifier/modifiers/protector';

export const sunlitFormation: SpellBlueprint = {
  id: 'sunlit-formation',
  name: 'Sunlit Formation',
  cardIconId: 'spells/sunlit-formation',
  description: dedent`
  Give +1 @[health]@ to a minion for every adjacent ally.
  @Paladin Affinity@ : it also gains @Protector@`,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.FLASH,
  spellSchool: SPELL_SCHOOLS.LIGHT,
  job: null,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  abilities: [],
  tags: [],
  canPlay: singleAllyMinionTargetRules.canPlay,
  getPreResponseTargets(game, card) {
    return singleAllyMinionTargetRules.getPreResponseTargets(game, card, {
      type: 'card',
      card
    });
  },
  async onInit(game, card) {
    await card.modifiers.add(new HeroJobAffinityModifier(game, card, HERO_JOBS.PALADIN));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard;

    const adjacentAllies = target.slot?.adjacentMinions.filter(m => m.isAlly(target));

    await target.modifiers.add(
      new SimpleHealthBuffModifier('sunlit-formation-buff', game, card, {
        amount: adjacentAllies?.length || 0
      })
    );

    const heroMod = card.modifiers.get(HeroJobAffinityModifier);
    if (heroMod?.isActive) {
      await target.modifiers.add(new ProtectorModifier(game, card, {}));
    }
  }
};
