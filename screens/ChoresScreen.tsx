import React, { useState } from 'react';
import { colors } from '../theme';
import { View } from 'react-native';
import { useStore } from '../store/store';
import { ChoreList } from './chores/ChoreList';
import { ChoreForm } from './chores/ChoreForm';
import { ConfirmDialog } from '../components/Dialog';

export function ChoresScreen() {
  const store = useStore();
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<number | null>(null);

  const editingChore = editingId != null ? store.chores.find((c) => c.id === editingId) ?? null : null;
  const confirmChore = confirmId != null ? store.chores.find((c) => c.id === confirmId) : null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      {view === 'list' ? (
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
        <ChoreForm
          initial={editingChore}
          onDone={() => {
            setView('list');
            setEditingId(null);
          }}
        />
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
