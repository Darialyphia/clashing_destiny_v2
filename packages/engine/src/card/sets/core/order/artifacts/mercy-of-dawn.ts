import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { EquipWeaponModifier } from '../../../../../modifier/modifiers/equip-weapon.modifier';
import { isMinion } from '../../../../card-utils';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { ArtifactCard } from '../../../../entities/artifact.entity';

export const mercyOfDawn: ArtifactBlueprint = {
  id: 'mercy-of-dawn',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  name: 'Mercy of Dawn',
  description: dedent`
  This card doesn't wake up at the start of the turn. When you summon a minion, wake up this card.`,
  faction: FACTIONS.ORDER,
  rarity: RARITIES.RARE,
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
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [],
  canPlay: () => true,
  async onInit(game, card) {
    // Prevent wake-up at start of turn
    await card.modifiers.add(
      new Modifier<ArtifactCard>('mercy-of-dawn-no-wakeup', game, card, {
        mixins: [
          new CardInterceptorModifierMixin(game, {
            key: 'shouldWakeUpAtTurnStart',
            interceptor: () => false
          })
        ]
      })
    );

    // Wake up when a min
    await card.modifiers.add(
      new Modifier<ArtifactCard>('mercy-of-dawn-wakeup-on-summon', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter(event) {
              if (!isMinion(event.data.card)) return false;
              if (!event.data.card.player.equals(card.player)) return false;
              if (event.data.card.location !== CARD_LOCATIONS.BOARD) return false;

              return true;
            },
            async handler() {
              if (card.isExhausted) {
                await card.wakeUp();
              }
            }
          })
        ]
      })
    );

    // Add Equip Weapon ability
    await card.modifiers.add(
      new EquipWeaponModifier(game, card, {
        manaCost: 0,
        speed: CARD_SPEED.BURST
      })
    );
  },
  async onPlay() {}
};
