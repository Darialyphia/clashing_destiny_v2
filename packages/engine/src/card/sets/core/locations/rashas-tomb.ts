import dedent from 'dedent';
import type { LocationBlueprint } from '../../../card-blueprint';
import { defaultCardArt, isSpell } from '../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  AFFINITIES,
  CARD_SPEED
} from '../../../card.enums';
import type { LocationCard } from '../../../entities/location.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { WhileOnBattlefieldModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { CardEffectTriggeredEvent } from '../../../card.events';
import { windDervish } from '../minions/wind-dervish';

export const rashasTomb: LocationBlueprint = {
  id: 'rashas-tomb',
  kind: CARD_KINDS.LOCATION,
  collectable: true,
  name: "Rasha's Tomb",
  description: dedent /*html*/ `
    When you play a Spell, summon a <rt-card>Wind Dervish</rt-card> here.
  `,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.COMMON,
  art: defaultCardArt('placeholder'),
  speed: CARD_SPEED.SLOW,
  affinities: [AFFINITIES.NEUTRAL],
  tags: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBattlefieldModifier<LocationCard>('rashas-tomb', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event => isSpell(event.data.card),
            async handler(event) {
              const player = event.data.card.player;
              const emptySpaceHere = player.boardSide.allSpaces.find(
                space => space.position.zone === card.location && space.isEmpty
              );
              if (!emptySpaceHere) return;

              await game.emit(
                GAME_EVENTS.CARD_EFFECT_TRIGGERED,
                new CardEffectTriggeredEvent({
                  card,
                  message: "Rasha's Tomb effect triggered"
                })
              );
              const dervish = await player.generateCard<MinionCard>(
                windDervish.id,
                card.isFoil
              );
              await dervish.playImmediatelyAt(emptySpaceHere, { shouldExhaust: false });
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
