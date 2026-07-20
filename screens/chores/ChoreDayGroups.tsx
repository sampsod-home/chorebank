import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../../theme';
import { useStore } from '../../store/store';
import { DayGroupItem, kidDayGroups } from '../../lib/domain';
import { Tag, Txt } from '../../components/ui';

type Filter = 'all' | 'allowance' | 'perChore';

export function ChoreDayGroups({ mode, kidId, filter }: { mode: 'current' | 'previous'; kidId: string; filter: Filter }) {
  const store = useStore();
  const groups = kidDayGroups(store, kidId, filter, mode);
  const kidName = store.kids.find((k) => k.id === kidId)?.name ?? '—';
  const filterLabel = filter === 'all' ? 'All chores' : filter === 'allowance' ? 'Allowance' : 'Pay per chore';
  const summary = `${kidName} · ${mode === 'current' ? 'Upcoming' : 'Past 30 days'} · ${filterLabel}`;

  const toggle = (item: DayGroupItem) => {
    if (!item.editable) return;
    if (item.isToday) {
      if (item.checked) store.uncheckChore(item.chore.id);
      else store.markDone(item.chore.id);
    } else {
      store.toggleCompletion(item.chore.id, item.iso);
    }
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.summary}>{summary}</Text>

      {groups.length === 0 ? (
        <Txt muted style={{ fontSize: 13 }}>
          No chores in this view.
        </Txt>
      ) : (
        groups.map((g) => (
          <View key={g.label} style={{ marginBottom: 16 }}>
            <Text style={styles.groupLabel}>{g.label}</Text>
            <View style={styles.groupCard}>
              {g.items.map((item, i) => (
                <Pressable
                  key={item.chore.id}
                  onPress={() => toggle(item)}
                  style={[styles.item, i > 0 && styles.itemDivide, { opacity: item.editable ? 1 : 0.55 }]}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: item.checked ? colors.accent : colors.text,
                        backgroundColor: item.checked ? colors.accent : 'transparent',
                      },
                    ]}
                  >
                    {item.checked && <Text style={styles.checkMark}>✓</Text>}
                  </View>
                  <Text style={[styles.itemTitle, item.isDone && { textDecorationLine: 'line-through' }]}>{item.chore.title}</Text>
                  {item.showPay && <Tag variant="accent">{item.valueLabel}</Tag>}
                </Pressable>
              ))}
            </View>
          </View>
        ))
      )}
      <View style={{ height: space[6] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[3] },
  summary: { fontFamily: 'Archivo_600SemiBold', fontSize: 12.5, color: colors.neutral[600], marginBottom: 14 },
  groupLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: colors.text, marginBottom: 8 },
  groupCard: { backgroundColor: colors.surface, borderRadius: 14, overflow: 'hidden' },
  item: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14 },
  itemDivide: { borderTopWidth: 1, borderTopColor: colors.divider },
  checkbox: { width: 26, height: 26, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  checkMark: { color: colors.bg, fontSize: 14, fontFamily: 'Archivo_800ExtraBold' },
  itemTitle: { flex: 1, fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
});
