import dedent from 'dedent';
import { DoubleAttackModifier } from '../../../../modifier/modifiers/double-attack.modifier';
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
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack.modifier';

export const HolyCrusader: MinionBlueprint = {
  id: 'holy-crusader',
  name: 'Holy Crusader',
  cardIconId: 'minions/holy-crusader',
  description: dedent`
  @Paladin Affinity@ : @Double Attack@ and this costs @[mana] 1@ less.
  @On Attack@: Heal adjacent allies for 2.
  `,
  collectable: true,
  unique: false,
  manaCost: 4,
  atk: 3,
  maxHp: 5,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  setId: CARD_SETS.CORE,
  speed: CARD_SPEED.SLOW,
  job: HERO_JOBS.WARRIOR,
  spellSchool: null,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const paladinMod = (await card.modifiers.add(
      new HeroJobAffinityModifier(game, card, HERO_JOBS.PALADIN)
    )) as HeroJobAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new DoubleAttackModifier(game, card, {
        mixins: [new TogglableModifierMixin(game, () => paladinMod.isActive)]
      })
    );

    await card.modifiers.add(
      new SimpleManacostModifier('holy-crusader-discount', game, card, {
        amount: -1,
        mixins: [new TogglableModifierMixin(game, () => paladinMod.isActive)]
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const adjacentAllies =
            card.slot?.adjacentMinions.filter(minion => minion.isAlly(card)) ?? [];

          for (const ally of adjacentAllies) {
            await ally.heal(2);
          }
        }
      })
    );
  },
  async onPlay() {}
};
