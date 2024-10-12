import { create } from 'zustand';

interface BucketListItem {
  key: string;
  item: string;
  dateCreated: string;
  started: boolean;
  completed: boolean;
}

interface BucketListStore {
  bucketListItem: string;
  bucketList: BucketListItem[];
  setBucketListItem: (item: string) => void;
  setBucketList: (items: BucketListItem[]) => void; // New action to set the entire bucket list
  clearBucketListItem: () => void;
  addBucketListItemLocal: (item: BucketListItem) => void;
  toggleStartedLocal: (key: string) => void;
  toggleCompletedLocal: (key: string) => void;
  removeBucketListItemLocal: (key: string) => void;
}

export const useBucketListStore = create<BucketListStore>(set => ({
  bucketListItem: '',
  bucketList: [],

  setBucketListItem: item => set({ bucketListItem: item }),

  // New action to set the entire bucket list in local state
  setBucketList: items => set({ bucketList: items }),

  clearBucketListItem: () => set({ bucketListItem: '' }),

  addBucketListItemLocal: item =>
    set(state => ({
      bucketList: [...state.bucketList, item],
    })),

  toggleStartedLocal: key =>
    set(state => ({
      bucketList: state.bucketList.map(item =>
        item.key === key ? { ...item, started: !item.started } : item
      ),
    })),

  toggleCompletedLocal: key =>
    set(state => ({
      bucketList: state.bucketList.map(item =>
        item.key === key ? { ...item, completed: !item.completed } : item
      ),
    })),

  removeBucketListItemLocal: key =>
    set(state => ({
      bucketList: state.bucketList.filter(item => item.key !== key),
    })),
}));
