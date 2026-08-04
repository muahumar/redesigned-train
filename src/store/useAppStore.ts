import { create } from 'zustand';
import { settingsRepository } from '../db/settingsRepository';

interface AppState {
  onboarded: boolean;
  setOnboarded: (value: boolean) => void;
  hydrate: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  onboarded: false,
  setOnboarded: (value) => {
    settingsRepository.set('onboarded', value ? 'true' : 'false');
    set({ onboarded: value });
  },
  hydrate: () => {
    const stored = settingsRepository.get('onboarded');
    set({ onboarded: stored === 'true' });
  },
}));
