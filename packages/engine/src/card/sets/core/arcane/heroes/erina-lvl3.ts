import dedent from 'dedent';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { WhileOnBoardModifier } from '../../../../../modifier/modifiers/while-on-board.modifier';
import { getEmpowerStacks } from '../../../../card-actions-utils';
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
import type { HeroCard } from '../../../../entities/hero.entity';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { SimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';

export const erinaLv3: HeroBlueprint = {
  id: 'erina-arcane-weaver',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Arcane Weaver',
  description: dedent`
  This card has +Atk equals to your @Empower@ stacks.
  While @Empowered@, Arcane spells in your hand have @Echo@ and cost 2 less`,
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
  destinyCost: 4,
  level: 3,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [],
  async onInit(game, card) {
    await card.modifiers.add(
      new WhileOnBoardModifier<HeroCard>('erina-lv3-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.player.equals(card.player) &&
                isSpell(candidate) &&
                candidate.location === CARD_LOCATIONS.HAND
              );
            },
            getModifiers() {
              return [
                new EchoModifier(game, card),
                new SimpleManacostModifier('erina-lv3-manacost-reduction', game, card, {
                  amount: 2
                })
              ];
            }
          }),
          new TogglableModifierMixin(game, () => getEmpowerStacks(card) > 0)
        ]
      })
    );

    await card.modifiers.add(
      new SimpleAttackBuffModifier('erina-lv3-attack-buff', game, card, {
        amount: () => getEmpowerStacks(card)
      })
    );
  },
  async onPlay() {}
};
