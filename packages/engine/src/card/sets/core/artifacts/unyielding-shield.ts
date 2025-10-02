import dedent from 'dedent';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { HeroInterceptorModifierMixin } from '../../../../modifier/mixins/interceptor.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  ARTIFACT_KINDS,
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import { ArtifactCard } from '../../../entities/artifact.entity';
import { HeroCard } from '../../../entities/hero.entity';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { OnDeathModifier } from '../../../../modifier/modifiers/on-death.modifier';
import { ToughModifier } from '../../../../modifier/modifiers/tough.modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const unyieldingShield: ArtifactBlueprint = {
  id: 'unyielding-shield',
  name: 'Unyielding Shield',
  cardIconId: 'artifacts/unyielding-shield',
  description: dedent`
  Your hero had @Tough (2)@ while not exhausted.
  When your hero takes damage this lose 1 @[durability]@.
  @On Destroyed@: Draw a card.
   `,
  collectable: true,
  setId: CARD_SETS.CORE,
  unique: false,
  destinyCost: 1,
  speed: CARD_SPEED.SLOW,
  rarity: RARITIES.EPIC,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  kind: CARD_KINDS.ARTIFACT,
  job: HERO_JOBS.PALADIN,
  spellSchool: null,
  durability: 3,
  subKind: ARTIFACT_KINDS.ARMOR,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit() {},
  async onPlay(game, card) {
    const aura = new ToughModifier<HeroCard>(game, card, {
      amount: 2,
      mixins: [
        new TogglableModifierMixin(game, () => !card.player.hero.isExhausted),
        new GameEventModifierMixin(game, {
          eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
          async handler(e) {
            if (!e.data.card.equals(card.player.hero)) return;
            await card.loseDurability(1);
          }
        })
      ]
    });

    await card.modifiers.add(
      new Modifier<ArtifactCard>('unyielding-shield', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              if (card.location !== 'board') return false;
              return candidate.equals(card.player.hero);
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(aura);
            },
            async onLoseAura(candidate) {
              await candidate.modifiers.remove(aura);
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnDeathModifier(game, card, {
        async handler() {
          await card.player.cardManager.draw(1);
        }
      })
    );
  }
};
