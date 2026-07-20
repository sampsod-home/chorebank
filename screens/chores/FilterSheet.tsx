import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '../../theme';
import { Kid } from '../../lib/types';
import { Icon } from '../../components/Icon';
import { IconButton, Txt } from '../../components/ui';

type Filter = 'all' | 'allowance' | 'perChore';
type Mode = 'current' | 'previous';

function Pill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        active ? { backgroundColor: colors.accent, borderColor: colors.accent } : { backgroundColor: colors.bg, borderColor: colors.divider },
        pressed && !active && { backgroundColor: colors.overlay07 },
      ]}
    >
      <Text style={[styles.pillLabel, { color: active ? colors.bg : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: space[6] }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.pillRow}>{children}</View>
    </View>
  );
}

export function FilterSheet({
  visible,
  onClose,
  kids,
  kidId,
  onKid,
  mode,
  onMode,
  filter,
  onFilter,
}: {
  visible: boolean;
  onClose: () => void;
  kids: Kid[];
  kidId: string;
  onKid: (id: string) => void;
  mode: Mode;
  onMode: (m: Mode) => void;
  filter: Filter;
  onFilter: (f: Filter) => void;
}) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        <View style={[styles.sheet, shadow.lg, { paddingBottom: insets.bottom + space[4] }]}>
          <View style={styles.header}>
            <IconButton onPress={onClose} accessibilityLabel="Close">
              <Icon name="x" size={20} color={colors.text} />
            </IconButton>
            <Txt variant="h4" style={{ flex: 1, textAlign: 'center' }}>
              Filters
            </Txt>
            <Pressable onPress={onClose} accessibilityRole="button" accessibilityLabel="Apply filters" style={styles.apply}>
              <Icon name="check" size={18} color={colors.bg} strokeWidth={2.5} />
            </Pressable>
          </View>

          <Section title="Kid">
            {kids.map((k) => (
              <Pill key={k.id} label={k.name} active={kidId === k.id} onPress={() => onKid(k.id)} />
            ))}
          </Section>

          <Section title="Show">
            <Pill label="Upcoming" active={mode === 'current'} onPress={() => onMode('current')} />
            <Pill label="Past" active={mode === 'previous'} onPress={() => onMode('previous')} />
          </Section>

          <Section title="Payment">
            <Pill label="All" active={filter === 'all'} onPress={() => onFilter('all')} />
            <Pill label="Allowance" active={filter === 'allowance'} onPress={() => onFilter('allowance')} />
            <Pill label="Pay per chore" active={filter === 'perChore'} onPress={() => onFilter('perChore')} />
          </Section>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: colors.scrim },
  sheet: {
    width: '100%',
    maxWidth: 402, // align with the web device frame; full-width on a real device
    backgroundColor: colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: space[4] + 4,
    paddingTop: space[3],
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: space[6] },
  apply: { width: 40, height: 40, borderRadius: radius.pill, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontFamily: 'Archivo_800ExtraBold', fontSize: 15, color: colors.text, marginBottom: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { minHeight: 40, paddingVertical: 9, paddingHorizontal: 18, borderRadius: radius.pill, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  pillLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 13 },
});
