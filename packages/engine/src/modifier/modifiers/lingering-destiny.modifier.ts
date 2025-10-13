import { KEYWORDS } from '../../card/card-keywords';
import { CARD_SPEED } from '../../card/card.enums';
import { CardEffectTriggeredEvent } from '../../card/card.events';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import type { MinionCard } from '../../card/entities/minion.entity';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { KeywordModifierMixin } from '../mixins/keyword.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class LingeringDestinyModifier<T extends AbilityOwner> extends Modifier<T> {
  constructor(game: Game, source: AnyCard, options?: { mixins?: ModifierMixin<T>[] }) {
    super(KEYWORDS.LINGERING_DESTINY.id, game, source, {
      name: KEYWORDS.LINGERING_DESTINY.name,
      description: KEYWORDS.LINGERING_DESTINY.description,
      isUnique: true,
      mixins: [
        new KeywordModifierMixin(game, KEYWORDS.LINGERING_DESTINY),
        new GrantAbilityModifierMixin(game, {
          id: 'lingering-destiny',
          description:
            'Bnish this card from your Discard pile to add a Mana Spark into your Destiny Zone',
          label: 'Banish: add Mana Spark in Destiny Zone.',
          isHiddenOnCard: true,
          getPreResponseTargets: () => Promise.resolve([]),
          canUse: () => {
            return this.target.location === 'discardPile';
          },
          manaCost: 0,
          shouldExhaust: false,
          speed: CARD_SPEED.FLASH,
          onResolve: async (game, card) => {
            await card.sendToBanishPile();
            const spark = await card.player.generateCard<MinionCard>('mana-spark');
            await spark.sendToDestinyZone();
          }
        }),
        ...(options?.mixins ?? [])
      ]
    });
  }
}
