import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { HeroBlueprint } from '../../../card-blueprint';
import { isMinion, singleEmptyAllySlot } from '../../../card-utils';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  HERO_JOBS,
  RARITIES
} from '../../../card.enums';
import type { HeroCard } from '../../../entities/hero.entity';
import { Modifier } from '../../../../modifier/modifier.entity';
import { AuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { MinionCard } from '../../../entities/minion.entity';
import { SimpleMinionStatsModifier } from '../../../../modifier/modifiers/simple-minion-stats.modifier';

export const aidenLv3: HeroBlueprint = {
  id: 'aiden-lv3',
  name: 'Aiden, Justicebringer',
  description: dedent`
  @Aiden Lineage@
  Your minions have +1 @[attack]@ and +1 @[health]@.
  @On Enter@: You may search your deck for a Warrior minion that costs @[mana] 2@ or less and summon it exhausted.
  `,
  cardIconId: 'heroes/aiden-lv3',
  kind: CARD_KINDS.HERO,
  level: 3,
  destinyCost: 3,
  speed: CARD_SPEED.SLOW,
  jobs: [HERO_JOBS.WARRIOR, HERO_JOBS.PALADIN],
  spellSchools: [],
  setId: CARD_SETS.CORE,
  rarity: RARITIES.LEGENDARY,
  collectable: true,
  unique: false,
  lineage: 'aiden',
  spellPower: 0,
  atk: 2,
  maxHp: 24,
  deckSource: CARD_DECK_SOURCES.DESTINY_DECK,
  abilities: [],
  tags: [],
  canPlay: () => true,
  async onInit(game, card) {
    const BUFF_ID = 'aiden-lv3-aura';

    await card.modifiers.add(
      new Modifier<HeroCard>('aiden-lv3', game, card, {
        mixins: [
          new AuraModifierMixin(game, {
            isElligible(candidate) {
              if (card.location !== 'board') return false;
              return (
                isMinion(candidate) &&
                candidate.isAlly(card) &&
                candidate.location === 'board'
              );
            },
            async onGainAura(candidate) {
              await candidate.modifiers.add(
                new SimpleMinionStatsModifier(BUFF_ID, game, card, {
                  name: 'Aiden, Justicebringer',
                  attackAmount: 1,
                  healthAmount: 1
                })
              );
            },
            onLoseAura(candidate) {
              return candidate.modifiers.remove(BUFF_ID);
            }
          })
        ]
      })
    );

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (!singleEmptyAllySlot.canPlay(game, card)) return;

          const [minionToSummon] = await game.interaction.chooseCards<MinionCard>({
            player: card.player,
            label: 'Choose a Warrior minion that costs 2 or less to summon',
            minChoiceCount: 0,
            maxChoiceCount: 1,
            choices: card.player.cardManager.mainDeck.cards.filter(c => {
              if (!isMinion(c)) return false;
              if (c.manaCost > 2) return false;
              if (c.job !== HERO_JOBS.WARRIOR) return false;
              return true;
            })
          });

          if (!minionToSummon) return;

          const [slot] = await game.interaction.selectMinionSlot({
            player: card.player,
            isElligible: position =>
              position.player.equals(card.player) &&
              !card.player.boardSide.getSlot(position.zone, position.slot)?.isOccupied,
            canCommit(selectedSlots) {
              return selectedSlots.length === 1;
            },
            isDone(selectedSlots) {
              return selectedSlots.length === 1;
            }
          });

          minionToSummon.removeFromCurrentLocation();
          await minionToSummon.playAt(slot);
          await minionToSummon.exhaust();
        }
      })
    );
  },
  async onPlay() {}
};
