import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import { LevelBonusModifier } from '../../../../modifier/modifiers/level-bonus.modifier';
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
import { ABILITY_EVENTS } from '../../../entities/ability.entity';
import { ArtifactCard } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';

export const forgedInTheCrater: SpellBlueprint = {
  id: 'forged-in-the-crater',
  name: 'Forged in the Crater',
  cardIconId: 'spell-forged-in-the-crater',
  description:
    'This turn, when you use a Weapon ability, give your hero +1@[attack]@ until the end of the turn. @[level] 3+@ : draw a card in your Destiny zone',
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
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
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
            eventName: ABILITY_EVENTS.ABILITY_AFTER_USE,
            async handler(event) {
              if (!(event.data.card instanceof ArtifactCard)) return;
              if (!event.data.card.player.equals(card.player)) return;
              if (event.data.card.subkind !== ARTIFACT_KINDS.WEAPON) return;
              stacks++;
            }
          })
        ]
      })
    );

    if (card.modifiers.get(LevelBonusModifier)?.isActive) {
      await card.player.cardManager.drawIntoDestinyZone(1);
    }
  }
};
