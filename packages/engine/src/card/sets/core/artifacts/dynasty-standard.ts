import dedent from 'dedent';
import type { ArtifactBlueprint } from '../../../card-blueprint';
import {
  battlefieldTargetingRules,
  defaultCardArt,
  singleAllyMinionTargetRules
} from '../../../card-utils';
import { CARD_KINDS, CARD_SETS, CARD_SPEED, RARITIES } from '../../../card.enums';
import type { LocationCard } from '../../../entities/location.entity';
import { CardAuraModifierMixin } from '../../../../modifier/mixins/aura.mixin';
import { SimpleStatsBuffModifier } from '../../../../modifier/modifiers/simple-stats-modifier';
import { ZealModifier } from '../../../../modifier/modifiers/zeal.modifier';
import { UntilEndOfTurnModifierMixin } from '../../../../modifier/mixins/until-end-of-turn.mixin';
import { Modifier } from '../../../../modifier/modifier.entity';
import type { Player } from '../../../../player/player.entity';
import { FACTION_IDS } from '../../../factions/factions';

export const dynastyStandard: ArtifactBlueprint = {
  id: 'dynasty-standard',
  name: 'Dynasty Standard',
  description: '',
  collectable: true,
  setId: CARD_SETS.CORE,
  art: defaultCardArt('artifacts/dynasty-standard'),
  kind: CARD_KINDS.ARTIFACT,
  rarity: RARITIES.RARE,
  manaCost: 2,
  manaSupply: 2,
  level: 3,
  exp: 1,
  factionId: FACTION_IDS.LYONAR,
  durability: 2,
  speed: CARD_SPEED.FAST,
  tags: [],
  shouldHideTargetArrows: true,
  abilities: [
    {
      id: 'dynasty-standard-ability',
      label: 'Equip',
      description: dedent /*html*/ `
      This turn, allies at a battlefield have +0/+2/+0. This loses 1 durability."
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
        const target = targets.cards[0] as LocationCard;
        if (!target) return;

        await card.player.modifiers.add(
          new Modifier<Player>('dynasty-standard-aura', game, card, {
            mixins: [
              new UntilEndOfTurnModifierMixin(game),
              new CardAuraModifierMixin(game, card, {
                isElligible(candidate) {
                  return candidate.isAlly(card) && candidate.location === target.location;
                },
                getModifiers() {
                  return [
                    new SimpleStatsBuffModifier('dynasty-standard-buff', game, card, {
                      atk: 2,
                      cmd: 0,
                      hp: 0
                    })
                  ];
                }
              })
            ]
          })
        );

        await card.loseDurability(1);
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
