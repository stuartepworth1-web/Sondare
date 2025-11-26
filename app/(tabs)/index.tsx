import { Tabs } from 'expo-router';
import { Code, Lightbulb, Palette, Settings, FolderOpen } from 'lucide-react-native';
import { StyleSheet, Platform, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CreditsProvider } from '@/contexts/CreditsContext';
import { useEffect, useState } from 'react';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(timer);
  }, []);

  if (!ready) {
    return <View style={{ flex: 1, backgroundColor: '#000000' }} />;
  }

  return (
    <CreditsProvider>
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#f97315',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          ...styles.tabBar,
          height: 85,
          paddingBottom: Math.max(insets.bottom, 20),
          paddingTop: 10,
        },
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ideas',
          tabBarIcon: ({ size, color }) => (
            <Lightbulb size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="builder"
        options={{
          title: 'Builder',
          tabBarIcon: ({ size, color }) => (
            <Code size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="design"
        options={{
          title: 'Design',
          tabBarIcon: ({ size, color }) => (
            <Palette size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="projects"
        options={{
          title: 'Projects',
          tabBarIcon: ({ size, color }) => (
            <FolderOpen size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings/profile"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/notifications"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/info"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/terms"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="settings/privacy"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="projects/[id]"
        options={{
          href: null,
        }}
      />
    </Tabs>
    </CreditsProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: 'System',
    marginTop: 4,
    marginBottom: 0,
  },
  tabBarItem: {
    paddingTop: 6,
    paddingBottom: 4,
  },
});
