import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../theme';
import { useStore } from '../store/store';
import { Button, Card, Chip, Field, IconButton, Input, Kicker, Tag, Txt } from '../components/ui';
import { Icon } from '../components/Icon';
import { ConfirmDialog } from '../components/Dialog';

type Editing = { kind: 'parent' | 'child'; id: string } | null;

export function FamilyScreen() {
  const store = useStore();
  const { parents, kids, currency } = store;

  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Editing>(null);
  const [type, setType] = useState<'parent' | 'child'>('child');
  const [first, setFirst] = useState('');
  const [last, setLast] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmRemove, setConfirmRemove] = useState<{ kind: 'parent' | 'child'; id: string; name: string } | null>(null);

  const members = useMemo(
    () => [
      ...[...parents]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((p) => ({ id: p.id, kind: 'parent' as const, name: p.name, typeLabel: 'Parent', contact: [p.phone, p.email].filter(Boolean).join(' · ') })),
      ...[...kids]
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((k) => ({ id: k.id, kind: 'child' as const, name: k.name, typeLabel: 'Child', contact: [k.phone, k.email].filter(Boolean).join(' · ') })),
    ],
    [parents, kids]
  );

  const openNew = () => {
    setEditing(null);
    setType('child');
    setFirst('');
    setLast('');
    setEmail('');
    setPhone('');
    setView('form');
  };

  const openEdit = (kind: 'parent' | 'child', id: string) => {
    const rec = kind === 'parent' ? parents.find((p) => p.id === id) : kids.find((k) => k.id === id);
    if (!rec) return;
    const parts = (rec.name || '').split(' ');
    setEditing({ kind, id });
    setType(kind);
    setFirst(parts[0] || '');
    setLast(parts.slice(1).join(' '));
    setEmail(rec.email || '');
    setPhone(rec.phone || '');
    setView('form');
  };

  const save = () => {
    const name = (first.trim() + ' ' + last.trim()).trim();
    if (!name) return;
    if (editing) store.updateFamily(editing.kind, editing.id, { name, email, phone });
    else store.addFamily({ kind: type, name, email, phone });
    setView('list');
    setEditing(null);
  };

  if (view === 'form') {
    return (
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.formHead}>
          <Txt variant="h4" style={{ flex: 1 }}>
            {editing ? 'Edit family member' : 'Add family member'}
          </Txt>
          <IconButton onPress={() => setView('list')} accessibilityLabel="Close">
            <Icon name="x" size={20} color={colors.text} />
          </IconButton>
        </View>

        <View style={styles.photoRow}>
          <View style={styles.photoCircle}>
            <Text style={styles.photoInitial}>{(first[0] || '').toUpperCase() || 'Photo'}</Text>
          </View>
          <Txt muted style={{ fontSize: 11.5, flex: 1 }}>
            Optional — a photo can be added on the kids’ iPad.
          </Txt>
        </View>

        {!editing && (
          <Field label="Account type" style={{ marginBottom: space[4] }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip label="Child" flex active={type === 'child'} onPress={() => setType('child')} style={{ minHeight: 44 }} />
              <Chip label="Parent" flex active={type === 'parent'} onPress={() => setType('parent')} style={{ minHeight: 44 }} />
            </View>
          </Field>
        )}

        <View style={{ flexDirection: 'row', gap: 12, marginBottom: space[4] }}>
          <Field label="First name" style={{ flex: 1 }}>
            <Input placeholder="First name" value={first} onChangeText={setFirst} />
          </Field>
          <Field label="Last name" style={{ flex: 1 }}>
            <Input placeholder="Last name" value={last} onChangeText={setLast} />
          </Field>
        </View>
        <Field label="Email (optional)" style={{ marginBottom: space[4] }}>
          <Input placeholder="e.g. name@email.com" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        </Field>
        <Field label="Phone (optional)" style={{ marginBottom: space[6] - 4 }}>
          <Input placeholder="e.g. (555) 123-4567" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        </Field>

        <Button title="Save" variant="primary" block minHeight={48} disabled={!first.trim()} onPress={save} />
        <View style={{ height: space[6] }} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <View style={styles.listHead}>
        <Txt variant="h4" style={{ flex: 1 }}>
          Family
        </Txt>
        <Pressable
          onPress={openNew}
          accessibilityRole="button"
          accessibilityLabel="Add member"
          style={({ pressed }) => [styles.addBtn, pressed && { backgroundColor: colors.overlay07 }]}
        >
          <Icon name="plus" size={17} color={colors.text} strokeWidth={2.5} />
        </Pressable>
      </View>

      {members.map((m) => (
        <Card key={m.kind + m.id} style={{ marginBottom: 14 }} gap={10}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{m.name[0]}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.memberName}>{m.name}</Text>
              {/* -10 offsets the tag's own horizontal padding so the label text
                  lines up with the name's first letter, not the pill edge. */}
              <View style={{ marginLeft: -10 }}>
                <Tag variant="neutral">{m.typeLabel}</Tag>
              </View>
              {m.contact ? <Text style={styles.memberContact}>{m.contact}</Text> : null}
            </View>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              <IconButton size={30} onPress={() => openEdit(m.kind, m.id)} accessibilityLabel="Edit">
                <Icon name="edit" size={16} color={colors.text} />
              </IconButton>
              <IconButton size={30} onPress={() => setConfirmRemove({ kind: m.kind, id: m.id, name: m.name })} accessibilityLabel="Remove">
                <Icon name="trash" size={16} color={colors.neutral[600]} />
              </IconButton>
            </View>
          </View>
        </Card>
      ))}
      <View style={{ height: space[4] }} />

      <ConfirmDialog
        visible={confirmRemove != null}
        title="Remove this family member?"
        body={confirmRemove ? `${confirmRemove.name} will be removed for good.` : undefined}
        confirmLabel="Remove"
        destructive
        onConfirm={() => {
          if (confirmRemove) store.removeFamily(confirmRemove.kind, confirmRemove.id);
          setConfirmRemove(null);
        }}
        onCancel={() => setConfirmRemove(null)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[4] },
  listHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  addBtn: { width: 30, height: 30, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  formHead: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  photoRow: { flexDirection: 'row', gap: 14, marginBottom: space[4], alignItems: 'center' },
  photoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.divider, alignItems: 'center', justifyContent: 'center' },
  photoInitial: { fontFamily: 'Archivo_800ExtraBold', fontSize: 24, color: colors.textMuted },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Archivo_800ExtraBold', fontSize: 17, color: colors.bg },
  memberName: { fontFamily: 'Archivo_800ExtraBold', fontSize: 17, color: colors.text },
  memberContact: { fontFamily: 'Archivo_400Regular', fontSize: 11, color: colors.textMuted, marginTop: 2 },
});
