import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../../theme';
import { useStore } from '../../store/store';
import { iconForChore, schedule, valueLabel } from '../../lib/domain';
import { Icon, iconBgColor } from '../../components/Icon';
import { IconButton, Tag, Txt } from '../../components/ui';

export function ChoreList({ onNew, onEdit, onDelete }: { onNew: () => void; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  const { chores, kids, currency } = useStore();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Txt variant="h4" style={{ flex: 1 }}>
          Chores
        </Txt>
        <Pressable
          onPress={onNew}
          accessibilityRole="button"
          accessibilityLabel="New chore"
          style={({ pressed }) => [styles.addBtn, pressed && { backgroundColor: colors.overlay07 }]}
        >
          <Icon name="plus" size={17} color={colors.text} strokeWidth={2.5} />
        </Pressable>
      </View>

      {chores.length === 0 ? (
        <Txt muted style={{ fontSize: 13 }}>
          No chores yet — add one.
        </Txt>
      ) : (
        chores.map((c) => {
          const ic = iconForChore(c);
          const kidLabel = c.kid === 'open' ? 'Marketplace' : kids.find((k) => k.id === c.kid)?.name ?? '—';
          const inactive = c.active === false;
          return (
            <View key={c.id} style={[styles.row, inactive && { opacity: 0.5 }]}>
              <View style={[styles.iconTile, { backgroundColor: iconBgColor(ic.bgKey) }]}>
                <Icon name={ic.name as any} size={22} color={colors.white} />
              </View>
              <View style={styles.mid}>
                <View style={styles.titleLine}>
                  <Text style={styles.title} numberOfLines={1}>
                    {c.title}
                  </Text>
                  {inactive && <Tag variant="neutral">Inactive</Tag>}
                </View>
                <Text style={styles.sub}>
                  {kidLabel} · {schedule(c)}
                </Text>
                <Text style={styles.value}>{valueLabel(c, currency)}</Text>
              </View>
              <View style={styles.rightIcons}>
                <IconButton size={30} onPress={() => onEdit(c.id)} accessibilityLabel="Edit">
                  <Icon name="edit" size={16} color={colors.text} />
                </IconButton>
                <IconButton size={30} onPress={() => onDelete(c.id)} accessibilityLabel="Remove">
                  <Icon name="trash" size={16} color={colors.neutral[600]} />
                </IconButton>
              </View>
            </View>
          );
        })
      )}
      <View style={{ height: space[6] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[4] },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  addBtn: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 4,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
  },
  iconTile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1, gap: 2 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
  rightIcons: { flexDirection: 'row', gap: 2 },
  value: { fontFamily: 'Archivo_800ExtraBold', fontSize: 15, color: colors.accentRamp[700], marginTop: 1 },
  sub: { fontFamily: 'Archivo_400Regular', fontSize: 11, color: colors.neutral[600] },
});
