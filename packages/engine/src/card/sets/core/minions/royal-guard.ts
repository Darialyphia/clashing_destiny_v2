import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { HeroJobAffinityModifier } from '../../../../modifier/modifiers/hero-job-affinity.modifier';
import type { MinionCard } from '../../../entities/minion.entity';
import { ToughModifier } from '../../../../modifier/modifiers/tough.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const royalGuard: MinionBlueprint = {
  id: 'royal-guard',
  name: 'Royal Guard',
  cardIconId: 'minions/royal-guard',
  description: dedent`
  @Paladin affinity@: @Tough (1)@.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 6,
  rarity: RARITIES.COMMON,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const paladinMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.PALADIN)
    )) as HeroJobAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new ToughModifier(game, card, {
        amount: 1,
        mixins: [new TogglableModifierMixin(game, () => paladinMod.isActive)]
      })
    );
  },
  async onPlay() {}
};
