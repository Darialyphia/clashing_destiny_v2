import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS
} from '../../../../card.enums';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { equipWeapon, isMinion } from '../../../../card-utils';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { ArtifactCard } from '../../../../entities/artifact.entity';
import { UniqueModifier } from '../../../../../modifier/modifiers/unique.modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';

export const mercyOfDawn: ArtifactBlueprint = {
  id: 'mercy-of-dawn',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mercy of Dawn',
  description: dedent`
  @Unique@.
  This card doesn't wake up at the start of the turn. When you summon a minion, wake up this card and this loses 1 durability.
  `,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.EPIC,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 1,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
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
  manaCost: 3,
  durability: 5,
  speed: CARD_SPEED.SLOW,
  abilities: [
    equipWeapon({
      modifierType: 'mercy-of-dawn-attack-buff',
      durabilityCost: 0,
      manaCost: 0,
      speed: CARD_SPEED.BURST
    })
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new UniqueModifier(game, card));

    await card.modifiers.add(
      new WhileOnBoardModifier<ArtifactCard>('mercy-of-dawn-custom-wakeup', game, card, {
        mixins: [
          new CardInterceptorModifierMixin(game, {
            key: 'shouldWakeUpAtTurnStart',
            interceptor: () => false
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter(event) {
              return isMinion(event.data.card) && event.data.card.isAlly(card);
            },
            async handler() {
              if (card.isExhausted) {
                await card.wakeUp();
                await card.loseDurability(1);
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};
