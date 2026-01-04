import { KEYWORDS } from '../../card/card-keywords';
import { CARD_LOCATIONS, CARD_SPEED } from '../../card/card.enums';
import type { AbilityOwner } from '../../card/entities/ability.entity';
import type { AnyCard } from '../../card/entities/card.entity';
import { manaSpark } from '../../card/sets/core/neutral/spells/mana-spark';
import type { Game } from '../../game/game';
import { GAME_EVENTS } from '../../game/game.events';
import { GrantAbilityModifierMixin } from '../mixins/grant-ability.mixin';
import { TogglableModifierMixin } from '../mixins/togglable.mixin';
import type { ModifierMixin } from '../modifier-mixin';
import { Modifier } from '../modifier.entity';

export class LingeringDestinyModifier<T extends AbilityOwner> extends Modifier<T> {
  constructor(
    game: Game,
    source: AnyCard,
    options: { mixins?: ModifierMixin<T>[] } = { mixins: [] }
  ) {
    super(KEYWORDS.LINGERING_DESTINY.id, game, source, {
      mixins: [
        new TogglableModifierMixin(
          game,
          () => this.target.location === CARD_LOCATIONS.DISCARD_PILE
        ),
        new GrantAbilityModifierMixin(game, {
          id: 'lingering-destiny-ability',
          description:
            'Banish this card from your discard pile to add a Mana Spark to your hand.',
          label: 'Lingering Destiny',
          canUse: (game, card) => card.location === CARD_LOCATIONS.DISCARD_PILE,
          getPreResponseTargets: () => Promise.resolve([]),
          manaCost: 0,
          shouldExhaust: false,
          speed: CARD_SPEED.BURST,
          isHiddenOnCard: true,
          onResolve: async (game, card) => {
            await card.sendToBanishPile();
            const spark = await card.player.generateCard(manaSpark.id);
            await spark.addToHand();
          }
        }),
        ...(options.mixins ?? [])
      ]
    });
  }
}
