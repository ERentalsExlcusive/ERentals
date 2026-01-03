import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BrandColors } from '@/constants/theme';

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.tabBar}>
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const color = isFocused
            ? BrandColors.black
            : BrandColors.gray.medium;

          return (
            <React.Fragment key={route.key}>
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                accessibilityLabel={options.tabBarAccessibilityLabel}
                testID={options.tabBarTestID}
                onPress={onPress}
                onLongPress={onLongPress}
                style={styles.tabButton}
              >
                <View style={styles.tabButtonContent}>
                  {options.tabBarIcon?.({ focused: isFocused, color, size: 22 })}
                  {options.title && (
                    <Text style={[
                      styles.tabLabel,
                      { color: isFocused ? BrandColors.black : BrandColors.gray.medium }
                    ]}>
                      {options.title}
                    </Text>
                  )}
                </View>
              </TouchableOpacity>
              {/* Add divider between tabs (but not after the last one) */}
              {index < state.routes.length - 1 && (
                <View style={styles.divider} />
              )}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Platform.OS === 'web' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(255, 255, 255, 0.98)',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    height: Platform.OS === 'web' ? 70 : 80,
    paddingBottom: Platform.OS === 'web' ? 8 : 24,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 999,
    ...(Platform.OS === 'web' ? {
      backdropFilter: 'blur(20px)',
      boxShadow: '0 -2px 12px rgba(0, 0, 0, 0.08)',
    } : {}),
  },
  tabBarContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-evenly',
    flex: 1,
    paddingHorizontal: 20,
    maxWidth: 500,
    alignSelf: 'center',
  },
  tabButton: {
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  tabButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
});
