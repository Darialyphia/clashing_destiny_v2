import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  emptyBoardSpaceTargetRules,
  singleEnemyMinionTargetRules
} from '../../../../card-utils';
import {
  JOBS,
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { CardAuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { astralBall } from '../../minions/arcane/astral-ball';
import { OnMoveModifier } from '../../../../../modifier/modifiers/on-move.modifier';
import type { Player } from '../../../../../player/player.entity';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { AbilityDamage } from '../../../../../utils/damage';
import type { MinionCard } from '../../../../entities/minion.entity';

export const cosmic: SpellBlueprint = {
  id: 'cosmicFlurry',
  name: 'Cosmic Flurry',
  description: dedent /*html*/ `
   This turn, your <rt-card>Astral Ball</rt-card> have
   "<rt-trigger>On Move</rt-trigger> Deal 1 damage to an enemy on a battlefield".
   <rt-runes runes="resonance,focus"></rt-runes> Summon an <rt-card>Astral Ball</rt-card> in your base.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder-spell'),
  kind: CARD_KINDS.SPELL,
  rarity: RARITIES.RARE,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  shouldHideTargetarrows: true,
  canPlay: () => true,
  getTargets: (game, card) => anywhereTargetRules.getTargets({ game, card }),
  async onInit() {},
  async onPlay(game, card) {
    await card.player.modifiers.add(
      new Modifier<Player>('cosmicFlurry', game, card, {
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new CardAuraModifierMixin(game, card, {
            isElligible(candidate) {
              return candidate.blueprint.id === astralBall.id && candidate.isAlly(card);
            },
            getModifiers() {
              return [
                new OnMoveModifier(game, card, {
                  async handler() {
                    const hasTarget = singleEnemyMinionTargetRules.canPlay(
                      game,
                      card,
                      minion => minion.isOnBattlefield
                    );
                    if (!hasTarget) return;
                    const target = await singleEnemyMinionTargetRules.getTargets({
                      game,
                      card,
                      timeoutFallback:
                        singleEnemyMinionTargetRules.defaultTimeoutFallback(game, card),
                      canCancel: false,
                      predicate: minion => minion.isOnBattlefield,
                      aiHints: {
                        shouldPick: () => 1
                      }
                    });

                    await target.result?.cards[0]?.takeDamage(card, new AbilityDamage(1));
                  }
                })
              ];
            }
          })
        ]
      })
    );

    if (card.player.runeManager.has({ resonance: 1, focus: 1 })) {
      const hasRoom = emptyBoardSpaceTargetRules.canPlay(
        game,
        space =>
          space.position.zone === CARD_LOCATIONS.BASE && space.player.equals(card.player)
      );
      if (!hasRoom) return;

      const position = await emptyBoardSpaceTargetRules.getTargets({
        game,
        card,
        predicate: space =>
          space.position.zone === CARD_LOCATIONS.BASE && space.player.equals(card.player),
        canCancel: false
      });
      const generatedCard = await card.player.generateCard<MinionCard>(
        astralBall.id,
        card.isFoil
      );
      await generatedCard.playImmediatelyAt(position.result.spaces[0]);
    }
  },
  aiHints: {
    shouldPlay: () => 1
  }
};
