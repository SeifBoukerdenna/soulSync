import { useEffect, useState } from 'react';
import { ref, onValue, set } from 'firebase/database';
import { database } from '@/firebaseConfig';
import { Alert } from 'react-native';

export interface Settings {
  numberOfStars: number;
  longPressDuration: number;
  numberOfMediaItems: number;
}

export const useSettingsOptions = () => {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const settingsRef = ref(database, 'settings/');

  useEffect(() => {
    const unsubscribe = onValue(
      settingsRef,
      snapshot => {
        const data = snapshot.val();
        if (data) {
          setSettings({
            numberOfStars: data.numberOfStars,
            longPressDuration: data.longPressDuration,
            numberOfMediaItems: data.numberOfMediaItems,
          });
        } else {
          const defaultSettings: Settings = {
            numberOfStars: 100,
            longPressDuration: 1000,
            numberOfMediaItems: 10,
          };
          setSettings(defaultSettings);
          set(settingsRef, defaultSettings).catch(err => {
            console.error('Error initializing default settings:', err);
            setError('Failed to initialize default settings.');
          });
        }
        setLoading(false);
      },
      error => {
        console.error('Error fetching settings:', error);
        setError('Failed to load settings.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateSettings = async (
    newSettings: Partial<Settings>
  ): Promise<void> => {
    if (!settingsRef) {
      setError('Settings reference not found.');
      return;
    }

    try {
      const updatedSettings = { ...settings, ...newSettings };
      await set(settingsRef, updatedSettings);
      setSettings(updatedSettings as Settings);
      Alert.alert('Success', 'Settings have been updated.');
    } catch (err) {
      console.error('Error updating settings:', err);
      Alert.alert(
        'Update Error',
        'There was a problem updating your settings.'
      );
      setError('Failed to update settings.');
    }
  };

  return { settings, loading, error, updateSettings };
};
