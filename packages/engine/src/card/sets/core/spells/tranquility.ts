import dedent from 'dedent';
import { SpellDamage } from '../../../../utils/damage';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import { EchoedDestinyModifier } from '../../../../modifier/modifiers/echoed-destiny.modifier';
import { singleAllyTargetRules } from '../../../card-utils';
import type { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.entity';

export const tranquility: SpellBlueprint = {
  id: 'tranquility',
  name: 'Tranquility',
  cardIconId: 'spell-tranquility',
  description: dedent`
  Heal an ally for 1 + @[spellpower]@."
  @Echoed Destiny@.
  `,
  collectable: true,
  unique: false,
  manaCost: 2,
  affinity: AFFINITIES.WATER,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.EPIC,
  subKind: SPELL_KINDS.BURST,
  tags: [],
  canPlay: singleAllyTargetRules.canPlay,
  getPreResponseTargets: async (game, card) =>
    singleAllyTargetRules.getPreResponseTargets(game, card, { type: 'card', card }),
  async onInit(game, card) {
    await card.modifiers.add(new EchoedDestinyModifier(game, card));
  },
  async onPlay(game, card, targets) {
    const target = targets[0] as MinionCard | HeroCard;

    await target.heal(1 + card.player.hero.spellPower);
  }
};
