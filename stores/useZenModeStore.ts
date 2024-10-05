import { create } from 'zustand';

type ZenModeState = {
  isZenMode: boolean;
  longPressDuration: number;
  setZenMode: (enabled: boolean) => void;
  setLongPressDuration: (duration: number) => void;
};

const useZenModeStore = create<ZenModeState>(set => ({
  isZenMode: false,
  longPressDuration: 1000,
  setZenMode: (enabled: boolean) => set({ isZenMode: enabled }),
  setLongPressDuration: (duration: number) =>
    set({ longPressDuration: duration }),
}));

export default useZenModeStore;
