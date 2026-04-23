import dedent from 'dedent';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { Modifier } from '../../../../../modifier/modifier.entity';
import { TARGETING_TYPE } from '../../../../../targeting/targeting-strategy';
import type { DestinyBlueprint } from '../../../../card-blueprint';
import { defaultCardArt } from '../../../../card-utils';
import { CARD_KINDS, CARD_SETS, JOBS, RARITIES } from '../../../../card.enums';
import type { HeroCard } from '../../../../entities/hero-card.entity';
import { GameEventModifierMixin } from '../../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../../game/game.events';
import { getWheelOfElementModifier } from '../../../../../modifier/modifiers/wheel-of-elements.modifier';
import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { match } from 'ts-pattern';
import { discardFromHand } from '../../../../card-actions-utils';
import { CardSimpleAttackBuffModifier } from '../../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { EmpowerModifier } from '../../../../../modifier/modifiers/empower.modifier';

export const confluxChosen: DestinyBlueprint = {
  id: 'conflux_chosen',
  name: "Conflux's Chosen",
  description: dedent`
    Whenever you play a spell of your current <rt-card>Wheel of the Elements</rt-card> element, choose one:
    <ul>
      <li>Draw a card, then discard a card</li>
      <li>Give your hero +1 Attack this turn</li>
      <li><rt-keyword>Empower (1)</rt-keyword></li>
    </ul>
    <rt-lvl-bonus lvl="4">Choose two</rt-lvl-bonus>.
  `,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.DESTINY,
  rarity: RARITIES.LEGENDARY,
  jobs: [JOBS.ELEMENTALIST.id],
  expCost: 2,
  tags: [],
  getTargets: () => Promise.resolve([]),
  getAoe: () => new NoAOEShape(TARGETING_TYPE.ANYWHERE, {}),
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 4));
  },
  async onPlay(game, card) {
    const wheelMod = getWheelOfElementModifier(game, card.player);
    const lvlMod = await card.modifiers.get(LevelBonusModifier)!;

    let element: 'fire' | 'water' | 'earth' | 'air' | null = null;

    await card.player.hero.modifiers.add(
      new Modifier<HeroCard>('fire-mastery-aura', game, card, {
        mixins: [
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_BEFORE_PLAY,
            filter: event => {
              if (!event) return false;
              const playedCard = event.data.card;
              return (
                playedCard.player.equals(card.player) &&
                playedCard.kind === CARD_KINDS.SPELL &&
                playedCard.hasTag(wheelMod!.currentElement)
              );
            },
            async handler() {
              // check the element before the card is played, to avoid race conditions where the wheel would rotate before our trigger
              element = wheelMod!.currentElement;
            }
          }),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.CARD_AFTER_PLAY,
            filter: event => {
              if (!event || !element) return false;
              const playedCard = event.data.card;
              return (
                playedCard.player.equals(card.player) &&
                playedCard.kind === CARD_KINDS.SPELL &&
                playedCard.hasTag(element!)
              );
            },
            async handler() {
              const choices = [
                {
                  id: 'draw-discard',
                  label: 'Draw 1, then discard 1'
                },
                {
                  id: 'atk-buff',
                  label: 'Give your hero +1 Attack this turn'
                },
                {
                  id: 'empower',
                  label: 'Empower (1)'
                }
              ];

              const selected: Array<'draw-discard' | 'atk-buff' | 'empower'> = [];

              const firstChoice = await game.interaction.askQuestion({
                player: card.player,
                source: card,
                questionId: 'conflux-chosen-trigger',
                label: 'Choose one',
                choices,
                timeoutFallback: choices[0].id
              });
              selected.push(firstChoice as any);
              if (lvlMod.isActive) {
                const secondChoice = await game.interaction.askQuestion({
                  player: card.player,
                  source: card,
                  questionId: 'conflux-chosen-trigger-2',
                  label: 'Choose one',
                  choices: choices.filter(c => c.id !== firstChoice),
                  timeoutFallback: choices.filter(c => c.id !== firstChoice)[0].id
                });
                selected.push(secondChoice as any);
              }

              for (const action of selected) {
                await match(action)
                  .with('draw-discard', async () => {
                    await card.player.cardManager.drawFromDeck(1);
                    await discardFromHand(game, card, { min: 1, max: 1 });
                  })
                  .with('atk-buff', async () => {
                    await card.player.hero.modifiers.add(
                      new CardSimpleAttackBuffModifier(
                        'conflux-chosen-atk-buff',
                        game,
                        card,
                        { amount: 1, mixins: [new UntilEndOfTurnModifierMixin(game)] }
                      )
                    );
                  })
                  .with('empower', async () => {
                    await card.player.hero.modifiers.add(
                      new EmpowerModifier(game, card, {
                        amount: 1
                      })
                    );
                  })
                  .exhaustive();
              }
            }
          })
        ]
      })
    );
  }
};
