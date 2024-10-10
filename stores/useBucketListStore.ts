import { create } from 'zustand';

interface BucketListStore {
  bucketListItem: string;
  bucketList: BucketListItem[];
  setBucketListItem: (item: string) => void;
  setBucketList: (items: BucketListItem[]) => void;
  clearBucketListItem: () => void;
  addBucketListItem: (item: string) => void;
  toggleStarted: (key: string) => void;
  toggleCompleted: (key: string) => void;
}

export const useBucketListStore = create<BucketListStore>(set => ({
  bucketListItem: '',
  bucketList: [],
  setBucketListItem: item => set({ bucketListItem: item }),
  setBucketList: items => set({ bucketList: items }),
  clearBucketListItem: () => set({ bucketListItem: '' }),

  // Add new item with additional properties
  addBucketListItem: item =>
    set(state => {
      const newItem: BucketListItem = {
        key: `${Date.now()}`, // Use timestamp as key
        item,
        dateCreated: new Date().toISOString(),
        started: false,
        completed: false,
      };
      return { bucketList: [...state.bucketList, newItem] };
    }),

  // Toggle started status
  toggleStarted: key =>
    set(state => ({
      bucketList: state.bucketList.map(item =>
        item.key === key ? { ...item, started: !item.started } : item
      ),
    })),

  // Toggle completed status
  toggleCompleted: key =>
    set(state => ({
      bucketList: state.bucketList.map(item =>
        item.key === key ? { ...item, completed: !item.completed } : item
      ),
    })),
}));
