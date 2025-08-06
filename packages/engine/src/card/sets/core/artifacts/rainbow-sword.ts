import dedent from 'dedent';
import { GAME_EVENTS } from '../../../../game/game.events';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { RemoveOnDestroyedMixin } from '../../../../modifier/mixins/remove-on-destroyed';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
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
import { ArtifactCard } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';

export const rainbowCeremonialSword: ArtifactBlueprint = {
  id: 'rainbow-sword',
  name: 'Rainbow Ceremonial Sword',
  cardIconId: 'artifact-rainbow-blade',
  description: dedent`
  @On Enter@ : Your hero gains +2 @[attack]@ and +2 @[spellpower]@ this turn.
  When your hero takes damage, this loses 1 @[durability]@.
  @On Destroyed@ : Draw 2 cards.`,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  manaCost: 4,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.ARTIFACT,
  affinity: AFFINITIES.NORMAL,
  durability: 3,
  subKind: ARTIFACT_KINDS.RELIC,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new OnEnterModifier(game, card, async () => {
        await card.player.hero.modifiers.add(
          new SimpleAttackBuffModifier<HeroCard>('rainbow-sword-attack', game, card, {
            amount: 2,
            name: 'Rainbow Sword',
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
        await card.player.hero.modifiers.add(
          new SimpleSpellpowerBuffModifier('rainbow-sword-spellpower', game, card, {
            amount: 2,
            name: 'Rainbow Sword',
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
      })
    );
  },
  async onPlay(game, card) {
    await card.modifiers.add(
      new Modifier<ArtifactCard>('rainbow-sword-durability', game, card, {
        mixins: [
          new RemoveOnDestroyedMixin(game),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            handler: async event => {
              if (!event.data.card.equals(card.player.hero)) return;
              await card.loseDurability(1);
            }
          })
        ]
      })
    );
    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(2);
        }
      })
    );
  }
};
