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
import { OnEnterModifier } from '../../../../../modifier/modifiers/on-enter.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { singleMinionTargetRules } from '../../../../card-utils';

export const exaltedAngel: MinionBlueprint = {
  id: 'exalted-angel',
  kind: CARD_KINDS.MINION,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Exalted Angel',
  description: dedent`
    @Honor@
    @On Enter@: Give @Honor@ to a minion with 3 or less Atk until the end of the turn.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
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
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ORDER.defaultCardTint
    }
  },
  manaCost: 4,
  speed: CARD_SPEED.SLOW,
  atk: 3,
  maxHp: 3,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(new HonorModifier(game, card));

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          const hasElligible = await singleMinionTargetRules.canPlay(game, card);
          if (!hasElligible) return;

          const targets = await singleMinionTargetRules.getPreResponseTargets(
            game,
            card,
            { type: 'card', card },
            card => card.deckSource === CARD_DECK_SOURCES.MAIN_DECK && card.atk <= 3
          );

          for (const target of targets) {
            await target.modifiers.add(
              new HonorModifier(game, card, {
                mixins: [new UntilEndOfTurnModifierMixin(game)]
              })
            );
          }
        }
      })
    );
  },
  async onPlay() {}
};
