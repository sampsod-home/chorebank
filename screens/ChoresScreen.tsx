import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../theme';
import { useStore } from '../store/store';
import { ChoreList } from './chores/ChoreList';
import { ChoreForm } from './chores/ChoreForm';
import { ChoreDayGroups } from './chores/ChoreDayGroups';
import { ConfirmDialog } from '../components/Dialog';

type SubTab = 'manage' | 'current' | 'previous';
type Filter = 'all' | 'allowance' | 'perChore';
const SUBTABS: [SubTab, string][] = [
  ['manage', 'Manage'],
  ['current', 'Current'],
  ['previous', 'Previous'],
];

export function ChoresScreen() {
  const store = useStore();
  const [subTab, setSubTab] = useState<SubTab>('manage');
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);
  // Shared across Current/Previous
  const [dayKid, setDayKid] = useState<string>(() => store.kids[0]?.id ?? '');
  const [filter, setFilter] = useState<Filter>('all');

  const editingChore = editingId != null ? store.chores.find((c) => c.id === editingId) ?? null : null;
  const confirmChore = confirmId != null ? store.chores.find((c) => c.id === confirmId) : null;

  // The create/edit form takes over the whole screen.
  if (view === 'form') {
    return (
      <ChoreForm
        initial={editingChore}
        onDone={() => {
          setView('list');
          setEditingId(null);
        }}
      />
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={styles.tabBar}>
        {SUBTABS.map(([id, label]) => {
          const active = subTab === id;
          return (
            <Pressable key={id} onPress={() => setSubTab(id)} style={styles.tab}>
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.text }]}>{label}</Text>
              <View style={[styles.tabRule, { backgroundColor: active ? colors.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {subTab === 'manage' ? (
        <ChoreList
          onNew={() => {
            setEditingId(null);
            setView('form');
          }}
          onEdit={(id) => {
            setEditingId(id);
            setView('form');
          }}
          onDelete={(id) => setConfirmId(id)}
        />
      ) : (
        <ChoreDayGroups mode={subTab} kidId={dayKid} filter={filter} onKid={setDayKid} onFilter={setFilter} />
      )}

      <ConfirmDialog
        visible={confirmId != null}
        title="Delete this chore?"
        body={confirmChore ? `${confirmChore.title} will be removed for good.` : undefined}
        confirmLabel="Delete"
        destructive
        onConfirm={() => {
          if (confirmId != null) store.deleteChore(confirmId);
          setConfirmId(null);
        }}
        onCancel={() => setConfirmId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: { flexDirection: 'row', gap: 18, paddingHorizontal: space[4] + 4, paddingTop: space[4], marginBottom: -4 },
  tab: { paddingBottom: 8 },
  tabLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 14 },
  tabRule: { height: 3, marginTop: 6, borderRadius: 2 },
});
