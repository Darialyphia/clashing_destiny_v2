import {
  type AnyObject,
  type JSONObject,
  type MaybePromise,
  type Serializable
} from '@game/shared';

type GenericEventMap = Record<Exclude<string, '*'>, AnyObject>;

type EmitterMode = 'sequential' | 'parallel';

export type EventMapWithStarEvent<TEvents extends GenericEventMap> = TEvents & {
  '*': StarEvent<TEvents>;
};

type Listener<
  TEvents extends GenericEventMap,
  Event extends keyof EventMapWithStarEvent<TEvents>
> = {
  handler: (eventArg: EventMapWithStarEvent<TEvents>[Event]) => MaybePromise<void>;
  priority: number;
};

export class TypedEventEmitter<TEvents extends GenericEventMap> {
  private _listeners: Partial<{
    [Event in keyof EventMapWithStarEvent<TEvents>]: Array<Listener<TEvents, Event>>;
  }> = {};

  private nextId = 0;

  constructor(private mode: EmitterMode = 'sequential') {}

  private async emitSequential<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    const listeners = Array.from(this._listeners[eventName] ?? []);
    const starListeners = Array.from(this._listeners['*'] ?? []);

    let i = 0;
    let j = 0;

    while (i < listeners.length || j < starListeners.length) {
      const listener = i < listeners.length ? listeners[i] : undefined;
      const starListener = j < starListeners.length ? starListeners[j] : undefined;

      if (!starListener || (listener && listener.priority >= starListener.priority)) {
        // @ts-expect-error
        await listener!.handler(eventArg);
        i++;
      } else {
        await starListener.handler(new StarEvent({ eventName, event: eventArg }) as any);
        j++;
      }
    }

    // for (const listener of listeners) {
    //   // @ts-expect-error
    //   await listener.handler(eventArg);
    // }
    // for (const listener of starListeners) {
    //   await listener.handler(new StarEvent({ eventName, event: eventArg }) as any);
    // }
  }

  private async emitParallel<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    const listeners = Array.from(this._listeners[eventName] ?? []).map(listener =>
      // @ts-expect-error
      listener.handler(eventArg)
    );

    await Promise.all(listeners);

    const starListeners = Array.from(this._listeners['*'] ?? []).map(listener =>
      listener.handler(new StarEvent({ eventName, event: eventArg }) as any)
    );
    await Promise.all(starListeners);
  }

  async emit<TEventName extends keyof TEvents & string>(
    eventName: TEventName,
    eventArg: TEvents[TEventName]
  ) {
    // @ts-expect-error
    eventArg.__id = this.nextId++;

    if (this.mode === 'sequential') {
      await this.emitSequential(eventName, eventArg);
    } else if (this.mode === 'parallel') {
      await this.emitParallel(eventName, eventArg);
    }
  }

  on<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>,
    priority = 0
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    this.insertSorted(this._listeners[eventName], { handler, priority });

    return () => this.off(eventName, handler as any);
  }

  once<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>,
    priority = 0
  ) {
    if (!this._listeners[eventName]) {
      this._listeners[eventName] = [];
    }
    let handled = false;
    const onceHandler = (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => {
      // makes sure the handler is only called once as some async weirdness might make the handler run twice before it gets cleaned up
      if (handled) return;
      handled = true;
      this.off(eventName, onceHandler as any);
      return handler(eventArg);
    };
    this.insertSorted(this._listeners[eventName], { handler: onceHandler, priority });

    return () => this.off(eventName, onceHandler as any);
  }

  private insertSorted(
    list: Array<Listener<TEvents, any>>,
    item: Listener<TEvents, any>
  ) {
    let low = 0;
    let high = list.length;
    while (low < high) {
      const mid = (low + high) >>> 1;
      if (item.priority > list[mid].priority) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    list.splice(low, 0, item);
  }

  off<TEventName extends keyof EventMapWithStarEvent<TEvents> & string>(
    eventName: TEventName,
    handler: (eventArg: EventMapWithStarEvent<TEvents>[TEventName]) => MaybePromise<void>
  ) {
    const listeners = this._listeners[eventName];
    if (!listeners) return;
    listeners.splice(
      listeners.findIndex(l => l.handler === handler),
      1
    );
    if (listeners.length === 0) {
      delete this._listeners[eventName];
    }
  }

  removeAllListeners() {
    this._listeners = {};
  }
}

export abstract class TypedSerializableEvent<TData, TSerialized extends JSONObject>
  implements Serializable<TSerialized>
{
  constructor(public data: TData) {}

  abstract serialize(): TSerialized;
}

type GenericSerializableEventMap = Record<
  string,
  TypedSerializableEvent<AnyObject, JSONObject>
>;

export class TypedSerializableEventEmitter<
  TEvents extends GenericSerializableEventMap
> extends TypedEventEmitter<TEvents> {}

export class StarEvent<TMap extends GenericEventMap> extends TypedSerializableEvent<
  {
    eventName: keyof TMap & string;
    event: TMap[keyof TMap];
  },
  {
    eventName: keyof TMap & string;
    event: ReturnType<TMap[keyof TMap]['serialize']>;
  }
> {
  serialize() {
    return {
      eventName: this.data.eventName,
      event: this.data.event.serialize()
    };
  }
}
