import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { HonorModifier } from '../../../../../modifier/modifiers/honor.modifier';
import { OnAttackModifier } from '../../../../../modifier/modifiers/on-attack.modifier';
import { SilencedModifier } from '../../../../../modifier/modifiers/silenced.modifier';
import { MinionCard } from '../../../../entities/minion.entity';
import { isMinion } from '../../../../card-utils';

export const firstWings: MinionBlueprint = {
  id: 'first-wings',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'First Wings',
  description: dedent`
    @Honor@, @Loyalty 1@.
    @On Attack@: if the attack target is a minion, @Silence@ it.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        lightGradient: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 6,
  speed: CARD_SPEED.SLOW,
  atk: 4,
  maxHp: 4,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));
    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler(event) {
          if (!isMinion(event.data.target)) return;
          await event.data.target.modifiers.add(
            new SilencedModifier<MinionCard>(game, event.data.target)
          );
        }
      })
    );
  },
  async onPlay() {}
};
