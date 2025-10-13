import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { DefenderModifier } from '../../../../modifier/modifiers/defender.modifier';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';

export const bastionGuard: MinionBlueprint = {
  id: 'bastion-guard',
  name: 'Bastion Guard',
  cardIconId: 'minions/bastion-guard',
  description: `@Warrior Affinity@: @Defender (2)@`,
  collectable: true,
  unique: false,
  manaCost: 3,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 5,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: null,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const warriorMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.WARRIOR)
    )) as HeroJobAffinityModifier<MinionCard>;
    await card.modifiers.add(
      new DefenderModifier(game, card, {
        amount: 2,
        mixins: [new TogglableModifierMixin(game, () => warriorMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
