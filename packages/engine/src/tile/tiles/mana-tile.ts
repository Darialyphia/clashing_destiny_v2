import type { TileBlueprint } from '../tile-blueprint';
import { TILE_EVENTS } from '../tile-enums';

export const manaTile: TileBlueprint = {
  id: 'mana-tile',
  name: 'Mana Tile',
  description: 'A tile that provides extra mana when a unit walks on it.',
  sprite: { id: 'mana-tile' },
  async onCreated(game, occupant, tile) {
    const cleanups = [
      await game.on(TILE_EVENTS.TILE_ENTER, async event => {
        if (event.data.tile.equals(tile)) {
          await tile.occupant?.player.gainMana(1);
          await game.tileSystem.addTile('mana-tile-depleted', tile.position);
        }
      }),
      await game.on(TILE_EVENTS.TILE_BEFORE_DESTROY, async event => {
        if (event.data.tile.equals(tile)) {
          cleanups.forEach(cleanup => cleanup());
        }
      })
    ];
  }
};
