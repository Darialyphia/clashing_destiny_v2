import { useSafeInject } from '@/shared/composables/useSafeInject';
import { ref, type Ref, type InjectionKey } from 'vue';

export type ToastVariant = 'success' | 'error' | 'info';

export type ToastOptions = {
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
};

export type ToastItem = {
  id: number;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
  open: boolean;
};

type ToastContext = {
  toasts: Ref<ToastItem[]>;
  add: (options: ToastOptions) => void;
  remove: (id: number) => void;
};

export const TOAST_INJECTION_KEY = Symbol(
  'TOAST_INJECTION_KEY'
) as InjectionKey<ToastContext>;

export const provideToast = (): ToastContext => {
  const toasts = ref<ToastItem[]>([]);
  let nextId = 0;

  const remove = (id: number) => {
    toasts.value = toasts.value.filter(toast => toast.id !== id);
  };

  const add = (options: ToastOptions) => {
    const id = nextId++;
    toasts.value.push({
      id,
      title: options.title,
      description: options.description,
      variant: options.variant ?? 'info',
      duration: options.duration ?? 3000,
      open: true
    });
  };

  provide(TOAST_INJECTION_KEY, { toasts, add, remove });
  return { toasts, add, remove };
};

export const useToast = () => {
  return useSafeInject(TOAST_INJECTION_KEY);
};
