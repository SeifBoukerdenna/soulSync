// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import Ionicons from '@expo/vector-icons/Ionicons';
import { Colors } from '@/constants/Colors';
import useZenModeStore from '@/stores/useZenModeStore';

export default function TabsLayout() {
  const { isZenMode } = useZenModeStore();

  return (
    <Tabs
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          switch (route.name) {
            case 'index':
              iconName = 'home-outline';
              break;
            case 'settings':
              iconName = 'settings-outline';
              break;
            case 'explore':
              iconName = 'compass-outline';
              break;
            case 'bucket-list':
              iconName = 'list-outline';
              break;
            default:
              iconName = 'alert-circle-outline';
              break;
          }

          return (
            <Ionicons
              name={iconName as keyof typeof Ionicons.glyphMap}
              size={size}
              color={color}
            />
          );
        },
        tabBarActiveTintColor: Colors.default.blue,
        tabBarInactiveTintColor: '#A8A8A8',
        tabBarStyle: {
          opacity: isZenMode ? 0.1 : 1,
          backgroundColor: 'rgba(55, 44, 65, 0.85)',
          position: 'absolute',
          left: 15,
          right: 15,
          bottom: 20,
          borderTopWidth: 2,
          paddingBottom: 5,
          borderRadius: 30,
          borderWidth: 2,
          borderTopColor: 'rgba(255, 255, 255, 0.3)',
          borderColor: 'rgba(255, 255, 255, 0.3)',
          overflow: 'hidden',
        },
        headerShown: false,
      })}
    >
      <Tabs.Screen name="index" options={{ tabBarShowLabel: false }} />
      <Tabs.Screen name="explore" options={{ tabBarShowLabel: false }} />
      <Tabs.Screen name="bucket-list" options={{ tabBarShowLabel: false }} />
      <Tabs.Screen name="settings" options={{ tabBarShowLabel: false }} />
    </Tabs>
  );
}
