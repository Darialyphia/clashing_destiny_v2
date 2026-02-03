import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../../card-blueprint';
import {
  CARD_SPEED,
  CARD_KINDS,
  CARD_DECK_SOURCES,
  CARD_SETS,
  RARITIES,
  FACTIONS,
  ARTIFACT_KINDS,
  CARD_LOCATIONS
} from '../../../../card.enums';
import { scry } from '../../../../card-actions-utils';
import { isSpell } from '../../../../card-utils';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { match } from 'ts-pattern';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { UntilEventModifierMixin } from '../../../../../modifier/mixins/until-event';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { Player } from '../../../../../player/player.entity';
import { AuraModifierMixin } from '../../../../../modifier/mixins/aura.mixin';
import { SimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';

export const bookOfKnowledge: ArtifactBlueprint = {
  id: 'book-of-knowledge',
  kind: CARD_KINDS.ARTIFACT,
  collectable: true,
  unique: false,
  setId: CARD_SETS.CORE,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  name: 'Book of Knowledge',
  description: dedent``,
  faction: FACTIONS.ARCANE,
  rarity: RARITIES.COMMON,
  subKind: ARTIFACT_KINDS.RELIC,
  tags: [],
  art: {
    default: {
      foil: {
        sheen: true,
        oil: true,
        gradient: true,
        lightGradient: false,
        scanlines: false
      },
      dimensions: {
        width: 174,
        height: 133
      },
      bg: 'placeholder-bg',
      main: 'placeholder',
      breakout: 'placeholder-breakout',
      frame: 'default',
      tint: FACTIONS.ARCANE.defaultCardTint
    }
  },
  destinyCost: 1,
  durability: 1,
  speed: CARD_SPEED.SLOW,
  abilities: [
    {
      id: 'book-of-knowledge-ability',
      description: dedent`
      Choose 1:
        • @Scry 3@
        • @Empower 1@
        • the next spell you play this turn costs @[mana] 1@ less.
      @[lvl] 3 bonus@: choose 2.
        `,
      label: 'Choose an Effect',
      canUse: (game, card) => card.location === CARD_LOCATIONS.BOARD,
      getPreResponseTargets: () => Promise.resolve([]),
      manaCost: 0,
      durabilityCost: 1,
      shouldExhaust: true,
      speed: CARD_SPEED.BURST,
      async onResolve(game, card) {
        const levelMod = card.modifiers.get(LevelBonusModifier);

        const choose = async () => {
          const choice = await game.interaction.askQuestion<
            'scry' | 'empower' | 'discount'
          >({
            player: card.player,
            label: levelMod?.isActive ? 'Choose 2 effects' : 'Choose an effect',
            questionId: 'book-of-knowledge-choice',
            source: card,
            choices: [
              { id: 'scry', label: 'Scry 3' },
              { id: 'empower', label: 'Empower 1' },
              { id: 'discount', label: 'Next Spell Cost -1' }
            ]
          });

          await match(choice)
            .with('scry', async () => {
              await scry(game, card, 3);
            })
            .with('empower', async () => {
              await card.player.hero.modifiers.add(
                new EmpowerModifier(game, card, { amount: 1 })
              );
            })
            .with('discount', async () => {
              await card.player.modifiers.add(
                new Modifier<Player>('book-of-knowledge-discount', game, card, {
                  mixins: [
                    new AuraModifierMixin(game, card, {
                      isElligible(candidate) {
                        return (
                          isSpell(candidate) &&
                          candidate.isAlly(card) &&
                          candidate.location === CARD_LOCATIONS.HAND
                        );
                      },
                      getModifiers() {
                        return [
                          new SimpleManacostModifier(
                            'book-of-knowledge-aura',
                            game,
                            card,
                            { amount: -1 }
                          )
                        ];
                      }
                    }),
                    new UntilEventModifierMixin(game, {
                      eventName: GAME_EVENTS.CARD_DECLARE_PLAY,
                      filter(event) {
                        console.log(event);
                        return event.data.card.isAlly(card) && isSpell(event.data.card);
                      }
                    })
                  ]
                })
              );
            })
            .exhaustive();
        };

        await choose();
        if (levelMod?.isActive) {
          await choose();
        }
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 3));
  },
  async onPlay() {}
};
