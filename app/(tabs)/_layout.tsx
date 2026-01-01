import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { CustomTabBar } from '@/components/custom-tab-bar';
import { GroupedAvatarsIcon, PhoneIcon } from '@/components/custom-icons';
import { BrandColors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        tabBarActiveTintColor: BrandColors.black,
        tabBarInactiveTintColor: BrandColors.gray.medium,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '500',
          marginTop: 2,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <IconSymbol
              size={22}
              name={focused ? "house.fill" : "house"}
              color={focused ? BrandColors.black : BrandColors.gray.medium}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Creators',
          tabBarIcon: ({ color, focused }) => (
            <GroupedAvatarsIcon
              size={22}
              color={focused ? BrandColors.black : BrandColors.gray.medium}
              focused={focused}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="contact"
        options={{
          title: 'Contact',
          tabBarIcon: ({ color, focused }) => (
            <PhoneIcon
              size={22}
              color={focused ? BrandColors.black : BrandColors.gray.medium}
              focused={focused}
            />
          ),
        }}
      />
    </Tabs>
  );
}
