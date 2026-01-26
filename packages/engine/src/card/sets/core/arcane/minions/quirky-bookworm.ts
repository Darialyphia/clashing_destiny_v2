import dedent from 'dedent';
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { LingeringDestinyModifier } from '../../../../../modifier/modifiers/lingering-destiny.modifier';

export const quirkyBookworm: MinionBlueprint = {
  id: 'quirky-bookworm',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Quirky Bookworm',
  description: dedent`
  @On Enter@: Draw a card in your Destiny Zone.
  @Lingering Destiny@.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: false,
        gradient: false,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'minions/quirky-bookworm-bg',
      main: 'minions/quirky-bookworm',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  atk: 1,
  maxHp: 1,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new LingeringDestinyModifier(game, card));
    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );
  },
  async onPlay() {}
};
