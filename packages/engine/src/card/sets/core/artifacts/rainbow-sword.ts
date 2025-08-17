import dedent from 'dedent';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { SimpleSpellpowerBuffModifier } from '../../../../modifier/modifiers/simple-spellpower.buff.modifier';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES
} from '../../../card.enums';
import { HeroCard } from '../../../entities/hero.entity';

export const rainbowCeremonialSword: ArtifactBlueprint = {
  id: 'rainbow-sword',
  name: 'Rainbow Ceremonial Sword',
  cardIconId: 'artifact-rainbow-blade',
  description: dedent`
  @On Destroyed@ : Draw 1 card.`,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 2,
  subKind: ARTIFACT_KINDS.WEAPON,
  atkBonus: 2,
  abilities: [
    {
      id: 'rainbow-ceremonial-sword-ability',
      label: '@[exhaust]@ : +2 @[attack]@',
      description: `@[exhaust]@ -1@[durability]@ : This turn, your hero gain +2@[attack]@.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new SimpleAttackBuffModifier<HeroCard>(
            'rainbow-ceremonial-sword-attack-buff',
            game,
            card,
            {
              amount: card.atkBonus,
              mixins: [new UntilEndOfTurnModifierMixin<HeroCard>(game)]
            }
          )
        );
        await card.loseDurability(1);
      }
    },
    {
      id: 'rainbow-ceremonial-sword-ability-2',
      label: '@[exhaust]@ : +2 @[spellpower]@',
      description: `@[exhaust]@ -1@[durability]@ : This turn, your hero gain +2@[spellpower]@.`,
      manaCost: 0,
      shouldExhaust: true,
      canUse(game, card) {
        return card.location === 'board';
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        await card.player.hero.modifiers.add(
          new SimpleSpellpowerBuffModifier(
            'rainbow-ceremonial-sword-spellpower-buff',
            game,
            card,
            {
              amount: card.atkBonus,
              mixins: [new UntilEndOfTurnModifierMixin<HeroCard>(game)]
            }
          )
        );
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(2);
        }
      })
    );
  }
};
