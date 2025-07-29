import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { SpellBlueprint } from '../../../card-blueprint';
import {
  AFFINITIES,
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  RARITIES,
  SPELL_KINDS
} from '../../../card.enums';
import { ARTIFACT_EVENTS } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';
import type { MinionCard } from '../../../entities/minion.card';

export const forgedInTheCrater: SpellBlueprint<MinionCard> = {
  id: 'forged-in-the-crater',
  name: 'Forged in the Crater',
  cardIconId: 'spell-forged-in-the-crater',
  description:
    'This turn, when you use a Weapon ability, give your hero +1@[attack]@ until the end of the turn.',
  collectable: true,
  unique: false,
  manaCost: 1,
  affinity: AFFINITIES.FIRE,
  kind: CARD_KINDS.SPELL,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  setId: CARD_SETS.CORE,
  rarity: RARITIES.RARE,
  subKind: SPELL_KINDS.CAST,
  tags: [],
  canPlay: () => true,
  getPreResponseTargets: async () => [],
  async onInit() {},
  async onPlay(game, card) {
    let stacks = 0;

    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('forgedInTheCrater', game, card, {
        mixins: [
          new UntilEndOfTurnModifierMixin(game),
          new HeroInterceptorModifierMixin(game, {
            key: 'atk',
            interceptor(value) {
              return value + stacks;
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: ARTIFACT_EVENTS.ARTIFACT_AFTER_USE_ABILITY,
            async handler(event) {
              if (!event.data.card.player.equals(card.player)) return;
              if (event.data.card.subkind !== ARTIFACT_KINDS.WEAPON) return;
              stacks++;
            }
          })
        ]
      })
    );
  }
};
