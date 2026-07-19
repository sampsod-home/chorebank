import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '../theme';
import { useStore } from '../store/store';
import { Wordmark } from './Brand';
import { Tag } from './ui';

export function TopBar() {
  const insets = useSafeAreaInsets();
  const { parents } = useStore();
  const parentName = parents[0]?.name ?? 'Parent';
  return (
    <View style={[styles.bar, { paddingTop: insets.top + 12 }]}>
      <View style={{ flex: 1 }}>
        <Wordmark />
      </View>
      <Tag variant="neutral">{parentName} · Parent</Tag>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: space[4] + 4,
    paddingBottom: space[3],
    borderBottomWidth: 2,
    borderBottomColor: colors.divider,
    backgroundColor: colors.bg,
  },
});
