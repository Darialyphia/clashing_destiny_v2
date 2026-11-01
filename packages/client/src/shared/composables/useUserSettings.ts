import { api } from '@game/api';
import type { InjectionKey } from 'vue';
import { useMe } from '@/auth/composables/useMe';
import { getDefaultSettings, type Settings } from '@/utils/settings';
import { useAuth } from '@/auth/composables/useAuth';
import { useConvexMutation, useConvexQuery } from '@convex-vue/core';
import { useSafeInject } from './useSafeInject';
import { defu } from 'defu';

export type UserSettingsContext = { settings: Ref<Settings>; save: () => void };
export const USER_SETTINGS_INJECTION_KEY = Symbol(
  'user_settings'
) as InjectionKey<UserSettingsContext>;

export const useUserSettingsProvider = () => {
  const { sessionId } = useAuth();

  const settings = ref(getDefaultSettings());
  const isLoggedIn = computed(() => !!sessionId.value);

  const { data: savedSettings } = useConvexQuery(
    api.users.settings,
    computed(() => ({ sessionId: sessionId.value! })),
    { enabled: isLoggedIn }
  );
  watchEffect(() => {
    if (savedSettings.value) {
      settings.value = defu(
        savedSettings.value,
        getDefaultSettings()
      ) as Settings;
    }
  });

  const { mutate: saveSettings } = useConvexMutation(api.users.saveSettings);

  provide(USER_SETTINGS_INJECTION_KEY, {
    settings,
    save: () => {
      if (!sessionId.value) return;
      saveSettings({ settings: settings.value, sessionId: sessionId.value });
    }
  });
};

export const useUserSettings = () => useSafeInject(USER_SETTINGS_INJECTION_KEY);
