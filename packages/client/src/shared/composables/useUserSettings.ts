import { api } from '@game/api';
import type { InjectionKey, Ref } from 'vue';
import {
  getDefaultSettings,
  SETTINGS_VERSION,
  type Settings
} from '@/utils/settings';
import {
  useAuth,
  useAuthedMutation,
  useAuthedQuery
} from '@/auth/composables/useAuth';
import { useSafeInject } from './useSafeInject';
import { defu } from 'defu';

export type UserSettingsContext = { settings: Ref<Settings>; save: () => void };
export const USER_SETTINGS_INJECTION_KEY = Symbol(
  'user_settings'
) as InjectionKey<UserSettingsContext>;

export const provideUserSettings = () => {
  const { sessionId } = useAuth();

  const settings = ref(getDefaultSettings());
  const isLoggedIn = computed(() => !!sessionId.value);

  const { data: savedSettings } = useAuthedQuery(
    api.users.settings,
    {},
    { enabled: isLoggedIn }
  );
  watchEffect(() => {
    if (savedSettings.value) {
      settings.value = defu(
        savedSettings.value.settings,
        getDefaultSettings()
      ) as Settings;
    }
  });

  const { mutate: saveSettings } = useAuthedMutation(api.users.saveSettings);

  provide(USER_SETTINGS_INJECTION_KEY, {
    settings,
    save: () => {
      if (!isLoggedIn.value) return;
      saveSettings({ version: SETTINGS_VERSION, settings: settings.value });
    }
  });
};

export const useUserSettings = () => useSafeInject(USER_SETTINGS_INJECTION_KEY);
