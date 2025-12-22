import { GAME_EVENTS } from '../../../../../game/game.events';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import type { HeroBlueprint } from '../../../../card-blueprint';
import { isSpell } from '../../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  CARD_SPEED,
  FACTIONS,
  RARITIES
} from '../../../../card.enums';
import { CardBeforePlayEvent } from '../../../../card.events';
import type { HeroCard } from '../../../../entities/hero.entity';

export const erinaLv3: HeroBlueprint = {
  id: 'erina-arcane-weaver',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Arcane Weaver',
  description: 'Your Arcane spells have @Echo@.',
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.LEGENDARY,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: false,
        oil: false,
        gradient: false,
        lightGradient: true,
        scanlines: true,
        foilLayer: true
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'heroes/erina-lv3-bg',
      main: 'heroes/erina-lv3',
      breakout: 'heroes/erina-lv3-breakout',
      foilArt: 'heroes/erina-lv3-foil',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 3,
  runeCost: {},
  level: 3,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv3-ability-1',
      canUse: () => true,
      shouldExhaust: true,
      manaCost: 0,
      runeCost: {},
      description: '@Empower 2@. The next spell you play this turn costs 1 less.',
      getPreResponseTargets: () => Promise.resolve([]),
      label: 'Improve next spell',
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        await card.modifiers.add(new EmpowerModifier(game, card, { amount: 2 }));

        const MANA_COST_MODIFIER_ID = 'erina-lv3-manacost-reduction';

        await card.modifiers.add(
          new Modifier<HeroCard>('erina-lv3-improve-next-spell', game, card, {
            mixins: [
              new AuraModifierMixin(game, {
                isElligible(candidate) {
                  return (
                    candidate.player.equals(card.player) &&
                    isSpell(candidate) &&
                    candidate.location === CARD_LOCATIONS.HAND
                  );
                },
                async onGainAura(candidate) {
                  await candidate.modifiers.add(
                    new SimpleManacostModifier(MANA_COST_MODIFIER_ID, game, candidate, {
                      amount: -1
                    })
                  );
                },
                async onLoseAura(candidate) {
                  await candidate.modifiers.remove(MANA_COST_MODIFIER_ID);
                }
              }),
              new UntilEventModifierMixin(game, {
                eventName: GAME_EVENTS.CARD_AFTER_PLAY,
                filter: event =>
                  event.data.card.player.equals(card.player) && isSpell(event.data.card)
              })
            ]
          })
        );
      }
    }
  ],
  async onInit(game, card) {},
  async onPlay() {}
};
