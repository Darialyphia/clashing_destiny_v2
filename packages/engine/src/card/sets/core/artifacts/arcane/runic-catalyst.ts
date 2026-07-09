import dedent from 'dedent';
import { InstantModifier } from '../../../../../modifier/modifiers/instant.modifier';
import { askMandatoryYesNoQuestion, scry } from '../../../../card-actions-utils';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import { defaultCardArt, anywhereTargetRules } from '../../../../card-utils';
import {
  CARD_SETS,
  CARD_KINDS,
  RARITIES,
  JOBS,
  AFFINITIES,
  CARD_SPEED
} from '../../../../card.enums';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import type { ArtifactCard } from '../../../../entities/artifact.entity';


export const runicCatalyst: ArtifactBlueprint = {
  id: 'runicCatalyst',
  name: 'Runic Catalyst',
  description: dedent /*html*/ `
    Whenever you consume a rune, you may gain 1 influence on a battlefield. If you do, this loses 1 durability.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.COMMON,
  jobs: [JOBS.ACOLYTE],
  affinities: [AFFINITIES.ARCANE],
  manaCost: 2,
  durability: 2,
  speed: CARD_SPEED.SLOW,
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(
      new Modifier<ArtifactCard>('runicCatalyst', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.PLAYER_AFTER_RUNE_CHANGE,
            filter: event =>
              event.data.player.equals(card.player) && event.data.lostRunes.length > 0,
            async handler() {
              const shouldGainInfluence = await askMandatoryYesNoQuestion({
                game,
                card,
                questionId: 'runicCatalystGainInfluence',
                aiChoice: 'yes',
                label: 'Gain 1 influence on a battlefield?'
              });
              if (!shouldGainInfluence) return;
              const result = await anywhereTargetRules.getTargets({
                game,
                card,
                label: 'Select a battlefield to gain 1 influence on.',
                canCancel: false,
                predicate: space =>
                  space.player.equals(card.player) && space.battlefield !== null
              });
              if (result.cancelled) return;
              const battlefield = result.result.spaces[0].battlefield!;
              await battlefield.gainScore(1);
              await card.loseDurability(1);
            }
          })
        ]
      })
    );
  },
  async onPlay(game, card) {},
  aiHints: {
    shouldPlay: () => 1
  }
};
