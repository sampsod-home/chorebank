import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../../theme';
import { useStore } from '../../store/store';
import { choreIcon, schedule, valueLabel } from '../../lib/domain';
import { Icon, iconBgColor } from '../../components/Icon';
import { IconButton, Tag, Txt } from '../../components/ui';
import { KebabMenu } from '../../components/Menu';

export function ChoreList({ onNew, onEdit, onDelete }: { onNew: () => void; onEdit: (id: number) => void; onDelete: (id: number) => void }) {
  const { chores, kids, currency } = useStore();

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.head}>
        <Txt variant="h4" style={{ flex: 1 }}>
          Chores
        </Txt>
        <IconButton onPress={onNew} accessibilityLabel="New chore">
          <Icon name="plus" size={18} color={colors.text} strokeWidth={2.5} />
        </IconButton>
      </View>

      {chores.length === 0 ? (
        <Txt muted style={{ fontSize: 13 }}>
          No chores yet — add one.
        </Txt>
      ) : (
        chores.map((c) => {
          const ic = choreIcon(c.title);
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
              </View>
              <View style={styles.rightCol}>
                <Text style={styles.value}>{valueLabel(c, currency)}</Text>
                <KebabMenu
                  items={[
                    { label: 'Edit', onPress: () => onEdit(c.id) },
                    { label: 'Remove', destructive: true, onPress: () => onDelete(c.id) },
                  ]}
                />
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    paddingVertical: 10,
    paddingLeft: 10,
    paddingRight: 4,
    marginBottom: 8,
    backgroundColor: colors.surface,
    borderRadius: 14,
  },
  iconTile: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  mid: { flex: 1, gap: 2, paddingTop: 1 },
  titleLine: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  title: { flex: 1, fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
  rightCol: { alignItems: 'flex-end', gap: 2, paddingTop: 1 },
  value: { fontFamily: 'Archivo_800ExtraBold', fontSize: 15, color: colors.accentRamp[700] },
  sub: { fontFamily: 'Archivo_400Regular', fontSize: 11, color: colors.neutral[600] },
});
