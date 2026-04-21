import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, defaultMinionPlaySequence } from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import type { SpellCard } from '../../../../entities/spell-card.entity';

export const arcaneMaster: MinionBlueprint = {
  id: 'arcane-master',
  name: 'Arcane Master',
  description: dedent`
  <rt-trigger>End of turn</rt-trigger>: If this did not attack this turn, draw a card.
  <rt-lvl-bonus lvl="4"></rt-lvl-bonus> If this card is a spell, it costs <rt-mana>2</rt-mana> less.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.FLYER,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  manaCost: 4,
  tags: [],
  atk: 2,
  retaliation: 1,
  maxHp: 6,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 4));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;

    await card.modifiers.add(
      new WhileOnBoardModifier(game, card, {
        modifier: new Modifier('arcane-master-draw', game, card, {
          mixins: [
            new GameEventModifierMixin(game, {
              eventName: GAME_EVENTS.TURN_END,
              unitForVisualFX: () => card.unit,
              filter() {
                return card.unit.combat.attacksCount === 0;
              },
              async handler() {
                const [drawnCard] = await card.player.cardManager.drawFromDeck(1);
                if (!drawnCard) return;
                if (lvlMod.isActive && drawnCard.kind === CARD_KINDS.SPELL) {
                  await (drawnCard as SpellCard).modifiers.add(
                    new SimpleManacostModifier<SpellCard>(
                      'arcane-master-mana-discount',
                      game,
                      card,
                      {
                        amount: -2
                      }
                    )
                  );
                }
              }
            })
          ]
        })
      })
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
