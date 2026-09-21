import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  defaultCardArt,
  isMinion,
  isSpell,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import type { MinionCard } from '../../../entities/minion.entity';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { EquippedModifier } from '../../../../modifier/modifiers/equip.modifier';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { isDefined } from '@game/shared';
import { AbilityDamage } from '../../../../utils/damage';

export const bloodrageMask: ArtifactBlueprint = {
  id: 'bloodrageMask',
  name: 'Bloodrage Mask',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('artifacts/bloodrage-mask'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.FIRE, AFFINITIES.FIRE, AFFINITIES.NEUTRAL],
  manaCost: 2,
  manaSupply: 2,
  durability: 3,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'bloodrage-mask-equip',
      label: 'Equip',
      description: dedent /*html*/ `
      <rt-keyword>Equip</rt-keyword>: Give the equipped minion +0/+2/+0 and "<rt-location locations="battlefield"></rt-location> When you play a Spell, deal 1 damage to all minions here."
      `,
      manaCost: 3,
      canUse: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
      getTargets: (game, card) =>
        singleAllyMinionTargetRules.getTargets({
          game,
          card,
          canCancel: true,
          timeoutFallback: singleAllyMinionTargetRules.defaultTimeoutFallback(game, card),
          aiHints: {
            shouldPick: () => 1
          }
        }),
      async onResolve(game, card, targets) {
        const target = targets.cards[0] as MinionCard;
        if (!target) return;

        if (card.modifiers.has(EquippedModifier)) {
          await card.modifiers.remove(EquippedModifier);
        }

        await card.modifiers.add(
          new EquippedModifier(game, card, {
            attachedTo: target,
            modifiersToAdd: [
              new SimpleAttackBuffModifier('cyclone-mask-atk-buff', game, card, {
                amount: 2
              }),
              new WhileOnBattlefieldModifier<MinionCard>(
                'bloodrage-mask-spellwatch',
                game,
                card,
                {
                  mixins: [
                    new GameEventModifierMixin(game, {
                      eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                      filter: event =>
                        isSpell(event.data.card) &&
                        event.data.card.player.equals(target.player),
                      async handler() {
                        const minionsToDamage = target
                          .battlefield!.spaces.map(space => space.card)
                          .filter(isDefined)
                          .filter(isMinion);
                        for (const minion of minionsToDamage) {
                          await minion.takeDamage(card, new AbilityDamage(1));
                        }
                      }
                    })
                  ]
                }
              )
            ]
          })
        );
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
