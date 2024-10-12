// app/components/RootLayout.tsx

import React, { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { Pressable, View, Text, StyleSheet, Alert, Platform, ActivityIndicator } from 'react-native';
import 'react-native-reanimated';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import useZenModeStore from '@/stores/useZenModeStore';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Toast from 'react-native-toast-message';
import { useSettingsOptions } from '@/hooks/useSettingsOptions'; // Import the custom hook
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '@/constants/Colors';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { isZenMode, setZenMode, longPressDuration, initializeZenMode } = useZenModeStore();
  const { settings, loading: settingsLoading, error: settingsError } = useSettingsOptions(); // Access settings
  const [showMessage, setShowMessage] = useState<string | null>(null);
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  // Initialize Zen Mode settings from Firebase on app start
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }

    initializeZenMode();
  }, [loaded]);

  // Handle long press to toggle Zen Mode
  const handleLongPress = () => {
    if (settings?.useDynamicBackground) {
      Alert.alert(
        "Cannot Change Zen Mode",
        "Please disable 'Use Dynamic Background Colors' before changing Zen Mode."
      );
      return;
    }

    const newZenMode = !isZenMode;
    setZenMode(newZenMode);
    setShowMessage(newZenMode ? 'Zen Mode Active' : 'Zen Mode Deactivated');

    setTimeout(() => {
      setShowMessage(null);
    }, 2000);
  };

  // Show loading indicator while fonts or settings are loading
  if (!loaded || settingsLoading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: Colors.default.background }]}>
        <ActivityIndicator size="large" color={Colors.default.blue} />
      </View>
    );
  }

  // Show error message if fetching settings fails
  if (settingsError) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: Colors.default.background }]}>
        <Text style={[styles.errorText, { color: Colors.default.red }]}>
          Error loading settings: {settingsError}
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <Toast />
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
      </QueryClientProvider>
    </GestureHandlerRootView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FF3B30',
  },
});
