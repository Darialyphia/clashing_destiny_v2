import { useSafeInject } from '@/shared/composables/useSafeInject';
import {
  useConvexMutation,
  useConvexQuery,
  type MutationReference,
  type QueryReference,
  type UseConvexQueryOptions
} from '@convex-vue/core';
import type { SessionId } from '@game/api';
import type { Ref } from 'vue';
import type { FunctionArgs } from 'convex/server';
import { useLocalStorage } from '@vueuse/core';

type AuthContext = {
  sessionId: Ref<SessionId | null>;
};

export const AUTH_INJECTION_KEY = Symbol(
  'AuthContext'
) as InjectionKey<AuthContext>;

export const provideAuth = () => {
  const sessionId = useLocalStorage(
    'clashing-destiny-session-id',
    null as SessionId | null
  );

  const router = useRouter();

  router.beforeEach(to => {
    if (to.meta.requiresAuth && !sessionId.value) {
      return { name: 'Login' };
    }
    if (to.meta.publicOnly && sessionId.value) {
      return { name: 'Home' };
    }
  });

  watch(
    sessionId,
    () => {
      if (!sessionId.value && router.currentRoute.value.meta.requiresAuth) {
        router.push({ name: 'Login' });
      }
      if (sessionId.value && router.currentRoute.value.meta.publicOnly) {
        router.push({ name: 'Home' });
      }
    },
    { immediate: true }
  );

  provide(AUTH_INJECTION_KEY, { sessionId });
};

export const useAuth = () => {
  return useSafeInject(AUTH_INJECTION_KEY);
};

export const useAuthedQuery = <Query extends QueryReference>(
  query: Query,
  args: MaybeRefOrGetter<Omit<FunctionArgs<Query>, 'sessionId'>>,
  options: UseConvexQueryOptions = { enabled: true }
) => {
  const { sessionId } = useAuth();
  return useConvexQuery(
    query,
    computed(() => ({ ...toValue(args), sessionId: sessionId.value })),
    {
      enabled: computed(() => {
        let enabled = unref(options.enabled);
        if (enabled === undefined) enabled = true;

        return !!(enabled && sessionId.value);
      })
    }
  );
};

export const useAuthedMutation = <Mutation extends MutationReference>(
  ...args: Parameters<typeof useConvexMutation<Mutation>>
) => {
  const { sessionId } = useAuth();
  const { mutate, ...rest } = useConvexMutation(...args);

  return {
    ...rest,
    mutate(mutationArgs: Omit<Mutation['_args'], 'sessionId'>) {
      if (!sessionId.value) return;
      return mutate({
        ...mutationArgs,
        sessionId: sessionId.value
      });
    }
  };
};
