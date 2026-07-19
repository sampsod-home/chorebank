import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../theme';
import { Icon, IconName } from './Icon';

const ICONS: Record<string, IconName> = {
  Home: 'home',
  Chores: 'chores',
  Payday: 'payday',
  Family: 'family',
};
const LABELS: Record<string, string> = {
  Home: 'HOME',
  Chores: 'CHORES',
  Payday: 'PAYDAY',
  Family: 'FAMILY',
};

export function TabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom + 10 }]}>
      {state.routes.map((route, i) => {
        const focused = state.index === i;
        const color = focused ? colors.accent : colors.neutral[600];
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };
        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            accessibilityRole="button"
            accessibilityState={focused ? { selected: true } : {}}
            style={styles.tab}
          >
            <Icon name={ICONS[route.name]} size={20} color={color} />
            <Text style={[styles.label, { color }]}>{LABELS[route.name]}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    borderTopWidth: 2,
    borderTopColor: colors.divider,
    backgroundColor: colors.bg,
    paddingTop: 10,
    paddingHorizontal: 4,
  },
  tab: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 6, minHeight: 44 },
  label: { fontFamily: 'Archivo_800ExtraBold', fontSize: 10.5, letterSpacing: 0.5 },
});
