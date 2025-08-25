import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { IntimidateModifier } from '../../../../modifier/modifiers/intimidate.modifier';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack';
import type { SpellCard } from '../../../entities/spell.entity';
import { shoalOfEels } from '../spells/shoal-of-eels';
import { Modifier } from '../../../../modifier/modifier.entity';
import { SpellInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';

export const nerathisMistressOfTheDepths: MinionBlueprint = {
  id: 'nerathis-mistress-of-the-depths',
  name: 'Nerathis, Mistress of the Depths',
  cardIconId: 'unit-nerathis-mistress-of-the-depth',
  description: dedent`
  @Pride (3)@.
  @Intimidate (3)@.
  @On Attack@ : Put a @Shoal of Eels@ into your hand that costs @[mana] 0@. 
  `,
  collectable: true,
  unique: false,
  manaCost: 5,
  atk: 4,
  maxHp: 4,
  rarity: RARITIES.LEGENDARY,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  affinity: AFFINITIES.WATER,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new IntimidateModifier(game, card, {
        minLevel: 3
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        handler: async () => {
          const createdCard = await card.player.generateCard<SpellCard>(shoalOfEels.id);
          await createdCard.modifiers.add(
            new Modifier('nerathis-discount', game, card, {
              mixins: [
                new SpellInterceptorModifierMixin(game, {
                  key: 'manaCost',
                  interceptor: () => 0
                })
              ]
            })
          );
          await createdCard.addToHand();
        }
      })
    );
  },
  async onPlay() {}
};
