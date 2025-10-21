import dedent from 'dedent';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { MinionCard } from '../../../entities/minion.entity';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';
import { GameEventModifierMixin } from '../../../../modifier/mixins/game-event.mixin';
import { GAME_EVENTS } from '../../../../game/game.events';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { OnAttackModifier } from '../../../../modifier/modifiers/on-attack.modifier';
import { AbilityDamage } from '../../../../utils/damage';

export const stoicOverlord: MinionBlueprint = {
  id: 'stoic-overlord',
  name: 'Stoic Overlord',
  cardIconId: 'minions/stoic-overlord',
  description: dedent`
  When your hero takes damage, this give this unit +2 @[attack]@ this turn.
  @On Attack@ : You may have this unit deal 3 damage to your hero.
  `,
  collectable: true,
  unique: false,
  manaCost: 3,
  atk: 2,
  maxHp: 5,
  rarity: RARITIES.RARE,
  deckSource: CARD_DECK_SOURCES.MAIN_DECK,
  kind: CARD_KINDS.MINION,
  spellSchool: null,
  job: null,
  speed: CARD_SPEED.SLOW,
  setId: CARD_SETS.CORE,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const ATTACK_BUFF_ID = 'stoic-overlord-attack-buff';

    await card.modifiers.add(
      new Modifier<MinionCard>('stoic-overlord-hero-damage-watch', game, card, {
        mixins: [
          new TogglableModifierMixin(game, () => card.location === 'board'),
          new GameEventModifierMixin(game, {
            eventName: GAME_EVENTS.HERO_AFTER_TAKE_DAMAGE,
            async handler(event) {
              if (!event.data.card.equals(card.player.hero)) return;
              await card.modifiers.add(
                new SimpleAttackBuffModifier(ATTACK_BUFF_ID, game, card, {
                  amount: 2,
                  mixins: [new UntilEndOfTurnModifierMixin(game)]
                })
              );
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnAttackModifier(game, card, {
        async handler() {
          const [answer] = await game.interaction.askQuestion({
            player: card.player,
            source: card,
            label: 'Do you want Stoic Overlord to deal 3 damage to your hero?',
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: [
              {
                id: 'yes',
                label: 'Yes'
              },
              {
                id: 'no',
                label: 'No'
              }
            ]
          });
          if (answer === 'yes') {
            await card.player.hero.takeDamage(card, new AbilityDamage(3));
          }
        }
      })
    );
  },
  async onPlay() {}
};
