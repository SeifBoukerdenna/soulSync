import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState, useRef } from 'react';
import { Pressable, View, Text, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import useZenModeStore from '@/stores/useZenModeStore';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isZenMode, setZenMode, longPressDuration } = useZenModeStore();
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  const handleLongPress = () => {
    const newZenMode = !isZenMode;
    setZenMode(newZenMode);
    setShowMessage(newZenMode ? 'Zen Mode Active' : 'Zen Mode Deactivated');

    setTimeout(() => {
      setShowMessage(null);
    }, 2000);
  };

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <Pressable
      onLongPress={handleLongPress}
      delayLongPress={longPressDuration}
      style={styles.pressableContainer}
    >
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>

      {showMessage && (
        <View style={styles.messageContainer}>
          <Text style={styles.messageText}>{showMessage}</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressableContainer: {
    flex: 1,
  },
  messageContainer: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  messageText: {
    color: '#fff',
    fontSize: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  zenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zenText: {
    color: '#fff',
    fontSize: 24,
  },
});
