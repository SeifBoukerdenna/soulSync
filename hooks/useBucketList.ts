import { useEffect, useRef } from 'react';
import { ref, onValue, set, remove, push, update } from 'firebase/database';
import { useBucketListStore } from '@/stores/useBucketListStore';
import { database } from '@/firebaseConfig';

interface BucketListItem {
  key?: string;
  item: string;
  dateCreated: string;
  started: boolean;
  completed: boolean;
}

export const useBucketList = () => {
  const {
    setBucketList,
    addBucketListItemLocal,
    toggleStartedLocal,
    toggleCompletedLocal,
    removeBucketListItemLocal,
  } = useBucketListStore();

  // Guard to prevent multiple subscriptions or renders
  const isInitialLoad = useRef(true);

  // Fetch data from Firebase and store it in Zustand's local state
  useEffect(() => {
    if (isInitialLoad.current) {
      const bucketListRef = ref(database, 'bucketList');
      const unsubscribe = onValue(bucketListRef, snapshot => {
        const data = snapshot.val();
        const items = data
          ? Object.keys(data).map(key => ({ key, ...data[key] }))
          : [];
        setBucketList(items); // Update the local state in Zustand
      });
      isInitialLoad.current = false;
      return () => unsubscribe(); // Cleanup subscription on unmount
    }
  }, [setBucketList]);

  // Add a new item to Firebase and Zustand
  const addItemToDB = (newItem: BucketListItem) => {
    const newItemRef = push(ref(database, 'bucketList'));
    set(newItemRef, newItem)
      .then(() => {
        addBucketListItemLocal({ key: newItemRef.key!, ...newItem });
      })
      .catch(error => {
        console.error('Error adding item to Firebase:', error);
      });
  };

  // Toggle "started" status in Firebase and Zustand
  const toggleStartedInDB = (key: string, newStartedStatus: boolean) => {
    update(ref(database, `bucketList/${key}`), { started: newStartedStatus })
      .then(() => {
        toggleStartedLocal(key);
      })
      .catch(error => {
        console.error('Error updating started status in Firebase:', error);
      });
  };

  // Toggle "completed" status in Firebase and Zustand
  const toggleCompletedInDB = (key: string, newCompletedStatus: boolean) => {
    update(ref(database, `bucketList/${key}`), {
      completed: newCompletedStatus,
    })
      .then(() => {
        toggleCompletedLocal(key); // Only update Zustand state after Firebase confirms
      })
      .catch(error => {
        console.error('Error updating completed status in Firebase:', error);
      });
  };

  // Remove an item from Firebase and Zustand
  const removeItemFromDB = (key: string) => {
    remove(ref(database, `bucketList/${key}`))
      .then(() => {
        removeBucketListItemLocal(key);
      })
      .catch(error => {
        console.error('Error removing item from Firebase:', error);
      });
  };

  return {
    addItemToDB,
    toggleStartedInDB,
    toggleCompletedInDB,
    removeItemFromDB,
  };
};
