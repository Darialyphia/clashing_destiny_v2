import dedent from 'dedent';
import type { Game } from '../../../../game/game';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { ArtifactCard } from '../../../entities/artifact.entity';
import type { AnyCard } from '../../../entities/card.entity';

export const philosophersStone: ArtifactBlueprint = {
  id: 'philosophers-stone',
  name: "Philosopher's Stone",
  cardIconId: 'artifacts/philosophers-stone',
  description: dedent`
  When your hero takes damage, gains a stack of Bloodstone.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: null,
  spellSchool: null,
  durability: 1,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [
    {
      id: 'philosophers-stone-ability',
      label: '@[exhaust]@ : Get card from Discard pile',
      description: `-1@[durability]@ @[exhaust]@ : Remove 4 stacks of Bloodstone. Add a card from your Discard pile to your hand.`,
      manaCost: 0,
      shouldExhaust: true,
      speed: CARD_SPEED.FAST,
      canUse(game, card) {
        return (
          card.location === 'board' &&
          (card.modifiers.get(BloodstoneModifier)?.stacks ?? 0) >= 4
        );
      },
      async getPreResponseTargets() {
        return [];
      },
      async onResolve(game, card) {
        const bloodstoneMod = card.modifiers.get(BloodstoneModifier);
        if (!bloodstoneMod) return;

        await bloodstoneMod.removeStacks(4);

        const choices = Array.from(card.player.cardManager.discardPile);
        if (choices.length === 0) return;
        const [selectedCard] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Select a card to retrieve from your discard pile',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          choices
        });

        await selectedCard.addToHand();
        await card.loseDurability(1);
      }
    }
  ],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<ArtifactCard>('philosophers-stone', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            async handler(event) {
              if (event.data.card.equals(card.player.hero)) {
                await card.modifiers.add(new BloodstoneModifier(game, card));
              }
            }
          })
        ]
      })
    );
  },
  async onPlay() {}
};

class BloodstoneModifier extends Modifier<ArtifactCard> {
  constructor(game: Game, card: AnyCard) {
    super('bloodstone', game, card, {
      name: 'Bloodstone',
      description: 'A stack of Bloodstone.',
      icon: 'modifier-bloodstone',
      mixins: []
    });
  }
}
