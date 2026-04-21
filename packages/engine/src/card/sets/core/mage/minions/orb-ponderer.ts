import dedent from 'dedent';
import type { MinionBlueprint } from '../../../../card-blueprint';
import {
  anywhereTargetRules,
  defaultCardArt,
  defaultMinionPlaySequence
} from '../../../../card-utils';
import {
  CARD_KINDS,
  CARD_LOCATIONS,
  CARD_SETS,
  JOBS,
  MINION_TYPES,
  RARITIES
} from '../../../../card.enums';

import { LevelBonusModifier } from '../../../../../modifier/modifiers/level-bonus.modifier';
import { TARGETING_TYPES } from '../../../../../aoe/aoe.enums';
import { NoAOEShape } from '../../../../../aoe/no-aoe.aoe-shape';
import { EchoModifier } from '../../../../../modifier/modifiers/echo.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../../modifier/mixins/until-end-of-turn.mixin';
import { AbilitySimpleManacostModifier } from '../../../../../modifier/modifiers/simple-manacost-modifier';
import { TogglableModifierMixin } from '../../../../../modifier/mixins/togglable.mixin';

export const orbPonderer: MinionBlueprint = {
  id: 'orb-ponderer',
  name: 'Orb Ponderer',
  description: dedent``,
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('placeholder'),
  kind: CARD_KINDS.MINION,
  subKind: MINION_TYPES.MELEE,
  rarity: RARITIES.RARE,
  jobs: [JOBS.MAGE.id],
  manaCost: 4,
  tags: [],
  atk: 2,
  retaliation: 2,
  maxHp: 6,
  abilities: [
    {
      id: 'orb-ponderer-ability',
      label: 'Give a spell in your hand Echo',
      description: dedent`
      Give a spell in your hand <rt-keyword>Echo</rt-keyword> this turn. 
      <rt-lvl-bonus lvl="4"></rt-lvl-bonus> This ability costs <rt-mana>1</rt-mana> less.
      `,
      manaCost: 1,
      canUse: (game, card) => {
        return (
          card.location === CARD_LOCATIONS.BOARD &&
          card.player.cardManager.hand.some(c => c.kind === CARD_KINDS.SPELL)
        );
      },
      getAoe: () => new NoAOEShape(TARGETING_TYPES.ENEMY_UNIT, {}),
      getCooldown: () => 0,
      getTargets: (game, card, onCancel) =>
        anywhereTargetRules.getTargets({ min: 1, max: 1 })(game, card, {
          canCancel: true,
          onCancel
        }),
      async onResolve(game, card) {
        const spellsInHand = card.player.cardManager.hand.filter(
          c => c.kind === CARD_KINDS.SPELL
        );
        const [choice] = await game.interaction.chooseCards({
          player: card.player,
          label: 'Choose a spell to give Echo to',
          minChoiceCount: 1,
          maxChoiceCount: 1,
          source: card,
          choices: spellsInHand,
          timeoutFallback: [spellsInHand[0]]
        });

        await choice.modifiers.add(
          new EchoModifier(game, card, {
            mixins: [new UntilEndOfTurnModifierMixin(game)]
          })
        );
      }
    }
  ],
  canPlay: () => true,
  async onInit(game, card) {
    await card.modifiers.add(new LevelBonusModifier(game, card, 4));
    const lvlMod = card.modifiers.get(LevelBonusModifier)!;
    const ability = card.getAbility('orb-ponderer-ability')!;

    await ability.modifiers.add(
      new AbilitySimpleManacostModifier(
        'orb-ponderer-ability-mana-reduction',
        game,
        card,
        {
          amount: -1,
          mixins: [new TogglableModifierMixin(game, () => lvlMod.isActive)]
        }
      )
    );
  },
  async onPlay() {},
  vfx: {
    sequences: {
      play: defaultMinionPlaySequence
    }
  }
};
