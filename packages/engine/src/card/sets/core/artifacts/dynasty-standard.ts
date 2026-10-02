import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  battlefieldTargetingRules,
  defaultCardArt,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import {
  AFFINITIES,
  CARD_KINDS,
  CARD_SETS,
  CARD_SPEED,
  RARITIES
} from '../../../card.enums';
import { WhileOnBoardModifier } from '../../../../modifier/modifiers/while-on-board.modifier';
import type { DestinyCard } from '../../../entities/destiny.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import type { ArtifactCard } from '../../../entities/artifact.entity';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { SimpleAttackBuffModifier } from '../../../../modifier/modifiers/simple-attack-buff.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';

export const dynastyStandard: ArtifactBlueprint = {
  id: 'dynasty-standard',
  name: 'Dynasty Standard',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('artifacts/dynasty-standard'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  affinities: [AFFINITIES.LIGHT, AFFINITIES.LIGHT],
  manaCost: 4,
  manaSupply: 2,
  durability: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'dynasty-standard-ability',
      label: 'Equip',
      description: dedent /*html*/ `
      Give allies at a battlefield: "<rt-keyword>Zeal 3</rt-keyword>: I have +0/+2/+0."
      `,
      manaCost: 1,
      canUse: (game, card) => singleAllyMinionTargetRules.canPlay(game, card),
      shouldExhaust: true,
      getTargets: (game, card) =>
        battlefieldTargetingRules.getTargets({
          game,
          card,
          timeoutFallback: [],
          canCancel: false,
          aiHints: { shouldPick: () => 1 }
        }),
      async onResolve(game, card, targets) {
        console.log(targets);
        const target = targets.cards[0] as DestinyCard;
        if (!target) return;

        await card.modifiers.add(
          new WhileOnBoardModifier<ArtifactCard>('dynasty-standard-aura', game, card, {
            mixins: [
              new UntilEndOfTurnModifierMixin(game),
              new CardAuraModifierMixin(game, card, {
                isElligible(candidate) {
                  return candidate.isAlly(card) && candidate.location === target.location;
                },
                getModifiers() {
                  return [
                    new ZealModifier('dynasty-standard-zeal', game, card, {
                      amount: 3,
                      zealedModifiers: [
                        new SimpleStatsBuffModifier(
                          'dynasty-standard-attack-buff',
                          game,
                          card,
                          { atk: 2, cmd: 0, hp: 0 }
                        )
                      ]
                    })
                  ];
                }
              })
            ]
          })
        );
      },
      aiHints: {
        shouldUse: () => 1
      }
    }
  ],
  canPlay: () => true,
  async onInit() {},
  async onPlay() {},
  aiHints: {
    shouldPlay: () => 1
  }
};
