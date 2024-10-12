// app/hooks/useBucketList.ts
import { useEffect, useState } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from '@/firebaseConfig';
import { ref, onValue, push, set, update, remove } from 'firebase/database';
import Toast from 'react-native-toast-message';

export type BucketItem = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  dateAdded: string; // ISO date string
};

const defaultItems = [
  { title: 'Travel to Japan', description: 'Explore Tokyo and Kyoto.' },
  {
    title: 'Learn to Play Guitar',
    description: 'Take lessons and practice daily.',
  },
  { title: 'Start a Blog', description: 'Write about your experiences.' },
];

const sampleItems = [
  {
    title: 'Visit the Grand Canyon',
    description: 'Experience the vastness of nature.',
  },
  { title: 'Learn a New Language', description: 'Become fluent in Spanish.' },
  { title: 'Run a Marathon', description: 'Complete a full marathon.' },
  { title: 'Write a Book', description: 'Share your stories with the world.' },
];

const useBucketList = () => {
  const [bucketItems, setBucketItems] = useState<BucketItem[]>([]);

  useEffect(() => {
    const bucketRef = ref(database, 'bucketList');

    const unsubscribe = onValue(bucketRef, snapshot => {
      const data = snapshot.val();
      const items: BucketItem[] = data
        ? Object.keys(data).map(key => ({
            id: key,
            title: data[key].title,
            description: data[key].description || '',
            completed: data[key].completed || false,
            dateAdded: data[key].dateAdded || new Date().toISOString(),
          }))
        : [];
      setBucketItems(items);
    });

    // Initialize bucket list with default items on first launch
    initializeBucketList();

    return () => unsubscribe();
  }, []);

  const initializeBucketList = async () => {
    try {
      const isFirstLaunch = await AsyncStorage.getItem('isFirstLaunch');
      if (isFirstLaunch === null) {
        // This is the first launch
        const bucketRef = ref(database, 'bucketList');
        const promises = defaultItems.map(item => {
          const newItemRef = push(bucketRef);
          return set(newItemRef, {
            ...item,
            completed: false,
            dateAdded: new Date().toISOString(),
          });
        });
        await Promise.all(promises);

        await AsyncStorage.setItem('isFirstLaunch', 'false');
        Toast.show({
          type: 'success',
          text1: 'Welcome!',
          text2: 'Default bucket list items have been added.',
        });
      }
    } catch (error) {
      console.error('Error initializing bucket list:', error);
    }
  };

  const addItem = async (title: string, description: string) => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    const bucketRef = ref(database, 'bucketList');
    const newItemRef = push(bucketRef);

    try {
      await set(newItemRef, {
        title,
        description,
        completed: false,
        dateAdded: new Date().toISOString(),
      });
      Toast.show({
        type: 'success',
        text1: 'Item Added',
        text2: `"${title}" has been added to your bucket list.`,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to add item');
    }
  };

  const editItem = async (id: string, title: string, description: string) => {
    if (!title.trim()) {
      Alert.alert('Validation', 'Title is required');
      return;
    }

    const itemRef = ref(database, `bucketList/${id}`);

    try {
      await update(itemRef, {
        title,
        description,
      });
      Toast.show({
        type: 'success',
        text1: 'Item Updated',
        text2: `"${title}" has been updated.`,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const deleteItem = (id: string) => {
    Alert.alert(
      'Delete Confirmation',
      'Are you sure you want to delete this item?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Proceed to delete the item from Firebase
              await remove(ref(database, `bucketList/${id}`));

              // Show the success toast only after the item is deleted
              Toast.show({
                type: 'success',
                text1: 'Item Deleted',
                text2: 'The item has been removed from your bucket list.',
              });
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to delete item');
            }
          },
        },
      ]
    );
  };

  const toggleCompletion = async (item: BucketItem) => {
    try {
      await update(ref(database, `bucketList/${item.id}`), {
        completed: !item.completed,
      });
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const addSampleItems = () => {
    Alert.alert(
      'Add Sample Items',
      'Are you sure you want to add sample items to your bucket list?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Add',
          onPress: async () => {
            const bucketRef = ref(database, 'bucketList');
            try {
              const promises = sampleItems.map(item => {
                const newItemRef = push(bucketRef);
                return set(newItemRef, {
                  ...item,
                  completed: false,
                  dateAdded: new Date().toISOString(),
                });
              });
              await Promise.all(promises);
              Toast.show({
                type: 'success',
                text1: 'Sample Items Added',
                text2: 'Your bucket list has been populated with sample items.',
              });
            } catch (error) {
              console.error(error);
              Alert.alert('Error', 'Failed to add sample items.');
            }
          },
        },
      ]
    );
  };

  return {
    bucketItems,
    addItem,
    editItem,
    deleteItem,
    toggleCompletion,
    addSampleItems,
  };
};

export default useBucketList;
