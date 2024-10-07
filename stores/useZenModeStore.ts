import { create } from 'zustand';
import { ref, onValue, set as firebaseSet } from 'firebase/database';
import { database } from '@/firebaseConfig';

type ZenModeState = {
  isZenMode: boolean;
  longPressDuration: number;
  setZenMode: (enabled: boolean) => void;
  setLongPressDuration: (duration: number) => void;
  initializeZenMode: () => void;
};

const useZenModeStore = create<ZenModeState>(set => ({
  isZenMode: false,
  longPressDuration: 1000,

  setZenMode: (enabled: boolean) => {
    set({ isZenMode: enabled });
    const zenModeRef = ref(database, 'settings/zenMode/isZenMode');

    firebaseSet(zenModeRef, enabled).catch(error => {
      console.error('Failed to update Zen Mode in Firebase:', error);
    });
  },

  setLongPressDuration: (duration: number) => {
    set({ longPressDuration: duration });
    const durationRef = ref(
      database,
      'settings/longPressDuration/longPressDuration'
    );

    firebaseSet(durationRef, duration).catch(error => {
      console.error('Failed to update Long Press Duration in Firebase:', error);
    });
  },

  initializeZenMode: () => {
    const zenModeRef = ref(database, 'settings/zenMode/isZenMode');
    const durationRef = ref(
      database,
      'settings/longPressDuration/longPressDuration'
    );

    onValue(zenModeRef, snapshot => {
      const isZenMode = snapshot.val();
      if (isZenMode !== null) {
        set({ isZenMode });
      }
    });

    onValue(durationRef, snapshot => {
      const longPressDuration = snapshot.val();
      if (longPressDuration !== null) {
        set({ longPressDuration });
      }
    });
  },
}));

export default useZenModeStore;
