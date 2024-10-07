import { create } from 'zustand';

type StarStoreState = {
  numberOfStars: number;
  setNumberOfStars: (num: number) => void;
};

const useStarsStore = create<StarStoreState>(set => ({
  numberOfStars: 100,
  setNumberOfStars: (num: number) => set(() => ({ numberOfStars: num })),
}));

export default useStarsStore;
