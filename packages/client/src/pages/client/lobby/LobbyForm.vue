<script setup lang="ts">
import { useAuthedMutation } from '@/auth/composables/useAuth';
import { useMe } from '@/auth/composables/useMe';
import { api } from '@game/api';
import UiTextInput from '@/ui/components/UiTextInput.vue';
import FancyButton from '@/ui/components/FancyButton.vue';

const router = useRouter();
const { mutate: createLobby, isLoading } = useAuthedMutation(
  api.lobbies.create,
  {
    onSuccess({ lobbyId }) {
      router.push({ name: 'Lobby', params: { id: lobbyId } });
    }
  }
);

const formData = ref({
  name: '',
  password: undefined as string | undefined
});

const onSubmit = () => {
  createLobby(formData.value);
};

const { data: me } = useMe();
</script>

<template>
  <form class="flex flex-col" @submit.prevent="onSubmit" v-if="me">
    <label for="lobby-name">Name</label>
    <UiTextInput id="lobby-name" v-model="formData.name" class="mb-3" />

    <label for="lobby-password">Password (optional)</label>
    <UiTextInput
      id="lobby-password"
      v-model="formData.password"
      type="password"
      class="mb-3"
    />

    <FancyButton
      type="submit"
      :is-loading="isLoading"
      class="primary-button"
      :disabled="me.currentLobby"
      text="Create"
    />
    <p v-if="me.currentLobby" class="c-orange-5 text-0">
      You cannot create a lobby because you are already in one.
    </p>
  </form>
</template>

<style scoped lang="postcss">
button {
  align-self: flex-end;
}
</style>
