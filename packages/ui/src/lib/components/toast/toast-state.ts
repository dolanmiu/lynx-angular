import { signal } from '@angular/core';

export type ToastAction = {
  readonly label: string;
  readonly onAction: () => void;
};

export type ToastData = {
  readonly id: string;
  readonly title?: string;
  readonly description?: string;
  readonly variant: 'default' | 'destructive';
  readonly duration: number;
  readonly action?: ToastAction;
};

export type ToastOptions = Partial<Omit<ToastData, 'id'>> & {
  readonly title: string;
};

let nextId = 0;

export const toasts = signal<readonly ToastData[]>([]);

export const toast = (options: ToastOptions): string => {
  const id = `toast-${nextId++}`;
  toasts.update((list) => [
    ...list,
    {
      id,
      variant: 'default',
      duration: 5000,
      ...options,
    },
  ]);
  return id;
};

export const dismissToast = (id: string): void => {
  toasts.update((list) => list.filter((t) => t.id !== id));
};
