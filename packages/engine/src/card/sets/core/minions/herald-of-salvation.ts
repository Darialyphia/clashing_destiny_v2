import dedent from 'dedent';
import { OnEnterModifier } from '../../../../modifier/modifiers/on-enter.modifier';
import type { MinionBlueprint } from '../../../card-blueprint';
import {
  CARD_DECK_SOURCES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES,
  SPELL_SCHOOLS
} from '../../../card.enums';
import { isMinion, singleEmptyAllySlot } from '../../../card-utils';
import type { MinionCard } from '../../../entities/minion.entity';
import { SpellSchoolAffinityModifier } from '../../../../modifier/modifiers/spell-school-affinity.modifier';
import { SimpleManacostModifier } from '../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../modifier/mixins/togglable.mixin';

export const heraldOfSalvation: MinionBlueprint = {
  id: 'herald-of-salvation',
  name: 'Herald of Salvation',
  cardIconId: 'minions/herald-of-salvation',
  description: dedent`
  @On Enter@ : Put a minion from your discard pile into play exhausted.
  @Light Affinity@: this costs @[mana] 2@ less.
  `,
  collectable: true,
  unique: false,
  manaCost: 6,
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
    const lightMod = (await card.modifiers.add(
      new SpellSchoolAffinityModifier(game, card, SPELL_SCHOOLS.LIGHT)
    )) as SpellSchoolAffinityModifier<MinionCard>;

    await card.modifiers.add(
      new SimpleManacostModifier('herald-of-salvation-discount', game, card, {
        amount: -2,
        mixins: [new TogglableModifierMixin(game, () => lightMod.isActive)]
      })
    );

    await card.modifiers.add(
      new OnEnterModifier(game, card, {
        handler: async () => {
          if (card.player.cardManager.discardPile.size === 0) return;
          if (!singleEmptyAllySlot.canPlay(game, card)) return;

          const [minionToSummon] = await game.interaction.chooseCards<MinionCard>({
            player: card.player,
            label: 'Choose a minion from your discard pile to put into play exhausted',
            minChoiceCount: 1,
            maxChoiceCount: 1,
            choices: Array.from(card.player.cardManager.discardPile).filter(c =>
              isMinion(c)
            )
          });

          const [position] = await singleEmptyAllySlot.getPreResponseTargets(game, card);

          await minionToSummon.playImmediatelyAt(position);
          await minionToSummon.exhaust();
        }
      })
    );
  },
  async onPlay() {}
};
