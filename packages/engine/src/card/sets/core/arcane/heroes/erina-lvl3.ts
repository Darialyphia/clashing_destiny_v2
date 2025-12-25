import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
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

export const erinaLv3: HeroBlueprint = {
  id: 'erina-arcane-weaver',
  kind: CARD_KINDS.HERO,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Erina, Arcane Weaver',
  description: `Your Arcane spells have @Echo@ and cost @[mana] 1@ less as long as you are @Empowered@.`,
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
  level: 3,
  lineage: 'erina',
  speed: CARD_SPEED.SLOW,
  atk: 0,
  maxHp: 21,
  canPlay: () => true,
  abilities: [
    {
      id: 'erina-lv3-ability',
      description: `@Empower@, then Wake up this Hero.`,
      label: 'Consume and Empower',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 2,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        await card.modifiers.add(new EmpowerModifier(game, card, { amount: 1 }));
        await card.wakeUp();
      }
    }
  ],
  async onInit(game, card) {
    const MANA_COST_MODIFIER_ID = 'erina-lv3-manacost-reduction';

    await card.modifiers.add(
      new Modifier<HeroCard>('erina-lv3-aura', game, card, {
        mixins: [
          new AuraModifierMixin(game, card, {
            isElligible(candidate) {
              return (
                candidate.player.equals(card.player) &&
                isSpell(candidate) &&
                candidate.location === CARD_LOCATIONS.HAND
              );
            },
            getModifiers(candidate) {
              return [
                new SimpleManacostModifier(MANA_COST_MODIFIER_ID, game, candidate, {
                  amount: -1
                })
              ];
            }
          }),
          new TogglableModifierMixin(
            game,
            () => card.location === CARD_LOCATIONS.BOARD && getEmpowerStacks(card) > 0
          )
        ]
      })
    );
  },
  async onPlay() {}
};
