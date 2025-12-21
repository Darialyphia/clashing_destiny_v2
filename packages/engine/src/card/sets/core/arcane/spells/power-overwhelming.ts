import dedent from 'dedent';
import type { SpellBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { CardInterceptorModifierMixin } from '../../../../../modifier/mixins/interceptor.mixin';
import { SpellCard } from '../../../../entities/spell.entity';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';

export const powerOverwhelming: SpellBlueprint = {
  id: 'power-overwhelming',
  kind: CARD_KINDS.SPELL,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Power Overwhelming',
  description: dedent`
  If you have @[knowledge]@ @[knowledge]@ @[knowledge]@ @[knowledge]@ @[knowledge]@, this is Burst speed.
  Your hero gains Atk equals to your @Spellpower@ until the end of the turn.
  `,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.EPIC,
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
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 2,
  runeCost: {
    KNOWLEDGE: 3,
    FOCUS: 1
  },
  speed: CARD_SPEED.FAST,
  abilities: [],
  canPlay: () => true,
  getPreResponseTargets: () => Promise.resolve([]),
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<SpellCard>('power-overwhekming-dynamic-speed', game, card, {
        mixins: [
          new CardInterceptorModifierMixin(game, {
            key: 'speed',
            interceptor(value) {
              if (card.player.hasRunes({ KNOWLEDGE: 5 })) {
                return CARD_SPEED.BURST;
              }
              return value;
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {
    const buff = card.player.hero.spellPower;
    await card.player.hero.modifiers.add(
      new SimpleAttackBuffModifier('power-overwhelming-attack-buff', game, card, {
        amount: buff,
        mixins: [new UntilEndOfTurnModifierMixin(game)]
      })
    );
  }
};
