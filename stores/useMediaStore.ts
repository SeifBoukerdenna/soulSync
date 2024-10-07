import { create } from 'zustand';

type MediaStoreState = {
  numberOfMediaItems: number;
  setNumberOfMediaItems: (num: number) => void;
};

const useMediaStore = create<MediaStoreState>(set => ({
  numberOfMediaItems: 10,
  setNumberOfMediaItems: (num: number) =>
    set(() => ({ numberOfMediaItems: num })),
}));

export default useMediaStore;
