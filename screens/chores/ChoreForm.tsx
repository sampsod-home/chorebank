import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius, space } from '../../theme';
import { useStore, ChoreDraft } from '../../store/store';
import { Chore } from '../../lib/types';
import { DAYS, fmt, formatDate, planned } from '../../lib/domain';
import { Button, Chip, Field, Hr, IconButton, Input, SegBar, Toggle, Txt } from '../../components/ui';
import { Icon } from '../../components/Icon';

type Freq = 'Daily' | 'Weekly' | 'Monthly';
const VALUE_PRESETS = [0.5, 1, 2, 5];
const TIMES = ['Morning', 'Afternoon', 'Evening'];

function initFrom(c: Chore | null, allKidIds: string[]) {
  if (!c) {
    return {
      assignMode: 'assign' as 'assign' | 'grabs',
      who: allKidIds,
      title: '',
      desc: '',
      active: true,
      repeatOn: false,
      freq: 'Daily' as Freq,
      days: [] as number[],
      monthDays: [] as number[],
      biweekly: false,
      timeOn: false,
      times: [] as string[],
      startDate: '2026-07-17',
      paymentType: 'allowance' as 'allowance' | 'perChore',
      reviewRequired: false,
      photoRequired: false,
      value: 1,
      custom: '',
    };
  }
  const preset = VALUE_PRESETS.includes(c.value);
  return {
    assignMode: c.kid === 'open' ? ('grabs' as const) : ('assign' as const),
    who: c.kid === 'open' ? [] : [c.kid],
    title: c.title,
    desc: c.desc || '',
    active: c.active !== false,
    repeatOn: !!c.recurring,
    freq: (c.freq || 'Daily') as Freq,
    days: [...(c.days || [])],
    monthDays: [...(c.monthDays || [])],
    biweekly: !!c.biweekly,
    timeOn: (c.times || []).length > 0,
    times: [...(c.times || [])],
    startDate: c.startDate || '2026-07-17',
    paymentType: (c.paymentType || 'perChore') as 'allowance' | 'perChore',
    reviewRequired: !!c.reviewRequired,
    photoRequired: !!c.photoRequired,
    value: preset ? c.value : 1,
    custom: preset ? '' : String(c.value),
  };
}

export function ChoreForm({ initial, onDone }: { initial: Chore | null; onDone: () => void }) {
  const store = useStore();
  const [f, setF] = useState(() => initFrom(initial, store.kids.map((k) => k.id)));
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((p) => ({ ...p, [k]: v }));
  const toggleIn = (k: 'who' | 'days' | 'monthDays' | 'times', v: never) =>
    setF((p) => ({ ...p, [k]: (p[k] as any[]).includes(v) ? (p[k] as any[]).filter((x) => x !== v) : [...(p[k] as any[]), v] }));

  const editing = !!initial;
  const isGrabs = f.assignMode === 'grabs';
  const isAllowance = f.paymentType === 'allowance';
  const isPerChore = f.paymentType === 'perChore';

  const pay = useMemo(() => {
    if (isAllowance) return 0;
    if (f.custom.trim()) {
      const v = parseFloat(f.custom.replace(/[^0-9.]/g, ''));
      return isNaN(v) ? 0 : v;
    }
    return f.value;
  }, [isAllowance, f.custom, f.value]);

  const freqMult = f.freq === 'Daily' ? 7 : f.freq === 'Monthly' ? Math.max(f.monthDays.length, 1) : Math.max(f.days.length, 1);
  const weeklyCost = f.repeatOn ? pay * freqMult : pay;

  const budgetHint = isGrabs
    ? 'Goes to the marketplace — either kid can claim it. Extras don’t count against the weekly allowance limit.'
    : isAllowance
    ? 'Counts toward completing the flat weekly allowance — no separate dollar amount.'
    : 'Adds ' +
      fmt(weeklyCost, store.currency) +
      (f.repeatOn ? '/week' : ' one-time') +
      '. ' +
      f.who
        .map((t) => {
          const k = store.kids.find((x) => x.id === t)!;
          const p = planned(store, t) + weeklyCost;
          return k.name + ': ' + fmt(p, store.currency) + ' of ' + fmt(k.limit, store.currency) + ' planned' + (p > k.limit ? ' — over the limit' : '');
        })
        .join(' · ');

  const invalidFreq = f.repeatOn && ((f.freq === 'Weekly' && !f.days.length) || (f.freq === 'Monthly' && !f.monthDays.length));
  const disabled = !f.title.trim() || (!isAllowance && !(pay > 0)) || invalidFreq || (!isGrabs && !f.who.length);

  const startsSummary =
    'Starts ' +
    formatDate(f.startDate) +
    (f.repeatOn ? ' and repeats ' + f.freq.toLowerCase() + (f.biweekly && f.freq === 'Weekly' ? ' (every other week)' : '') : ' — one time');

  const cta = editing
    ? 'Save changes'
    : (isGrabs ? 'Post to marketplace — ' : 'Add chore') + (isAllowance ? '' : ' — ' + fmt(pay > 0 ? pay : 0, store.currency));

  const submit = () => {
    if (disabled) return;
    const draft: ChoreDraft = {
      title: f.title,
      desc: f.desc,
      value: isAllowance ? 0 : pay,
      paymentType: f.paymentType,
      reviewRequired: f.reviewRequired,
      photoRequired: f.photoRequired,
      active: f.active,
      recurring: f.repeatOn,
      freq: f.freq,
      days: f.days,
      monthDays: f.monthDays,
      times: f.times,
      start: 'Today',
      startDate: f.startDate,
      biweekly: f.biweekly,
      targets: isGrabs ? ['open'] : f.who,
    };
    if (editing && initial) store.updateChore(initial.id, draft);
    else store.addChore(draft);
    onDone();
  };

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
      <View style={styles.head}>
        <Txt variant="h4" style={{ flex: 1 }}>
          {editing ? 'Edit chore' : 'New chore'}
        </Txt>
        <IconButton onPress={onDone} accessibilityLabel="Close">
          <Icon name="x" size={20} color={colors.text} />
        </IconButton>
      </View>
      <Txt muted style={{ fontSize: 12.5, marginBottom: space[4] }}>
        {isGrabs ? 'Posts to the marketplace — kids pick it up from their iPad for extra money.' : 'It lands on the kids’ iPad instantly.'}
      </Txt>

      {/* Assign vs Up for grabs */}
      <SegBar style={{ marginBottom: space[4] }}>
        <Chip label="Assign" flex active={!isGrabs} bordered={false} onPress={() => set('assignMode', 'assign')} style={styles.segChip} />
        <Chip
          label="Up for grabs"
          flex
          active={isGrabs}
          bordered={false}
          onPress={() => setF((p) => ({ ...p, assignMode: 'grabs', paymentType: 'perChore' }))}
          style={[styles.segChip, styles.segDivide]}
        />
      </SegBar>

      {/* Kid avatars (assign mode) */}
      {!isGrabs && (
        <View style={{ flexDirection: 'row', gap: 18, marginBottom: 18 }}>
          {store.kids.map((k) => {
            const checked = f.who.includes(k.id);
            return (
              <Pressable key={k.id} onPress={() => toggleIn('who', k.id as never)} style={{ alignItems: 'center', gap: 6 }}>
                <View style={{ width: 56, height: 56 }}>
                  <View
                    style={[
                      styles.kidAvatar,
                      { backgroundColor: checked ? colors.accent : colors.neutral[200], borderColor: checked ? colors.accent : 'transparent' },
                    ]}
                  >
                    <Text style={[styles.kidInitial, { color: checked ? colors.bg : colors.text }]}>{k.name[0]}</Text>
                  </View>
                  {checked && (
                    <View style={styles.kidCheck}>
                      <Text style={styles.kidCheckMark}>✓</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.kidLabel}>{k.name}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <Field label="Chore name" style={{ marginBottom: space[4] }}>
        <Input placeholder="e.g. Water the plants" value={f.title} onChangeText={(v) => set('title', v)} />
      </Field>
      <Field label="Chore description" style={{ marginBottom: space[4] }}>
        <Input placeholder="Enter chore description" value={f.desc} onChangeText={(v) => set('desc', v)} multiline />
      </Field>

      {/* Active — its own small card */}
      <View style={styles.activeCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Active</Text>
          <Toggle value={f.active} onValueChange={(v) => set('active', v)} />
        </View>
      </View>

      {/* Schedule card */}
      <View style={styles.schedCard}>
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Repeats</Text>
          <Toggle value={f.repeatOn} onValueChange={(v) => set('repeatOn', v)} />
        </View>

        {f.repeatOn && (
          <>
            <SegBar>
              {(['Daily', 'Weekly', 'Monthly'] as Freq[]).map((fr, i) => (
                <Chip key={fr} label={fr} flex active={f.freq === fr} bordered={false} onPress={() => set('freq', fr)} style={[styles.segChip, i > 0 && styles.segDivide]} />
              ))}
            </SegBar>

            {f.freq === 'Weekly' && (
              <>
                <View style={{ flexDirection: 'row', gap: 6 }}>
                  {DAYS.map((d, i) => (
                    <Chip key={i} label={d} flex active={f.days.includes(i)} onPress={() => toggleIn('days', i as never)} style={{ paddingHorizontal: 0 }} />
                  ))}
                </View>
                <Pressable style={styles.checkRow} onPress={() => set('biweekly', !f.biweekly)}>
                  <View style={[styles.checkbox, f.biweekly && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                    {f.biweekly && <Text style={styles.checkboxMark}>✓</Text>}
                  </View>
                  <Text style={styles.checkText}>Every other week</Text>
                </Pressable>
              </>
            )}

            {f.freq === 'Monthly' && (
              <View style={styles.monthGrid}>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                  <Chip key={d} label={String(d)} active={f.monthDays.includes(d)} onPress={() => toggleIn('monthDays', d as never)} style={styles.monthCell} />
                ))}
              </View>
            )}
            <Hr style={{ marginVertical: 0 }} />
          </>
        )}

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Time of day</Text>
          <Toggle value={f.timeOn} onValueChange={(v) => set('timeOn', v)} />
        </View>
        {f.timeOn && (
          <>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {TIMES.map((t) => (
                <Chip key={t} label={t} flex active={f.times.includes(t)} onPress={() => toggleIn('times', t as never)} />
              ))}
            </View>
            <Hr style={{ marginVertical: 0 }} />
          </>
        )}

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Starts</Text>
          <View style={styles.dateChip}>
            <Text style={styles.dateChipText}>{formatDate(f.startDate)}</Text>
          </View>
        </View>
      </View>
      <Txt muted style={{ fontSize: 11.5, marginBottom: space[4] }}>
        {startsSummary}
      </Txt>

      {/* Payment */}
      <Field label="Payment" style={{ marginBottom: space[4] }}>
        <View style={{ gap: 10 }}>
          <PaymentOption
            title="Required for allowance"
            body="Chore must be completed to receive allowance"
            selected={isAllowance}
            disabled={isGrabs}
            onPress={() => set('paymentType', 'allowance')}
          />
          {isAllowance && (
            <>
              <Pressable style={[styles.checkRow, { paddingLeft: 32 }]} onPress={() => set('reviewRequired', !f.reviewRequired)}>
                <View style={[styles.checkbox, f.reviewRequired && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                  {f.reviewRequired && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.checkText}>Review chore before allowance is paid</Text>
              </Pressable>
              <Pressable style={[styles.checkRow, { paddingLeft: 32 }]} onPress={() => set('photoRequired', !f.photoRequired)}>
                <View style={[styles.checkbox, f.photoRequired && { backgroundColor: colors.accent, borderColor: colors.accent }]}>
                  {f.photoRequired && <Text style={styles.checkboxMark}>✓</Text>}
                </View>
                <Text style={styles.checkText}>Photo required for review</Text>
              </Pressable>
            </>
          )}
          <PaymentOption
            title="Pay per chore"
            body="Set an amount and pay once chore is complete"
            selected={isPerChore}
            onPress={() => set('paymentType', 'perChore')}
          />
        </View>
      </Field>

      {isPerChore && (
        <Field label="Pays" style={{ marginBottom: space[4] }}>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            {VALUE_PRESETS.map((v) => (
              <Chip
                key={v}
                label={fmt(v, store.currency)}
                active={!f.custom.trim() && f.value === v}
                onPress={() => setF((p) => ({ ...p, value: v, custom: '' }))}
                style={{ minHeight: 44 }}
              />
            ))}
            <Input placeholder="Custom $" value={f.custom} onChangeText={(v) => set('custom', v)} keyboardType="decimal-pad" style={{ width: 104, minHeight: 44 }} />
          </View>
        </Field>
      )}

      <Txt muted style={{ fontSize: 11.5, marginBottom: space[4] }}>
        {budgetHint}
      </Txt>

      <Button title={cta} variant="primary" block minHeight={48} disabled={disabled} onPress={submit} />
      <View style={{ height: space[6] }} />
    </ScrollView>
  );
}

function PaymentOption({ title, body, selected, disabled, onPress }: { title: string; body: string; selected: boolean; disabled?: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[styles.payOption, { backgroundColor: selected ? colors.accentRamp[100] : 'transparent' }, disabled && { opacity: 0.45 }]}
    >
      <View style={[styles.radioOuter, { borderColor: selected ? colors.accent : colors.divider }]}>
        {selected && <View style={styles.radioInner} />}
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.payTitle}>{title}</Text>
        <Text style={styles.payBody}>{body}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[4] },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 },
  segChip: { borderRadius: 0, minHeight: 44 },
  segDivide: { borderLeftWidth: 1, borderLeftColor: colors.divider },
  kidAvatar: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
  kidInitial: { fontFamily: 'Archivo_800ExtraBold', fontSize: 22 },
  kidCheck: { position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: 9, backgroundColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  kidCheckMark: { color: colors.bg, fontSize: 11, fontFamily: 'Archivo_800ExtraBold' },
  kidLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 13, color: colors.text },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0 },
  toggleLabel: { flex: 1, fontFamily: 'Archivo_800ExtraBold', fontSize: 15, color: colors.text },
  activeCard: { backgroundColor: colors.surface, borderRadius: 14, paddingVertical: space[3], paddingHorizontal: space[4], marginBottom: 14 },
  schedCard: { backgroundColor: colors.surface, borderRadius: 14, padding: space[4], marginBottom: 14, gap: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  checkbox: { width: 18, height: 18, borderWidth: 1.5, borderColor: colors.divider, borderRadius: 4, alignItems: 'center', justifyContent: 'center' },
  checkboxMark: { color: colors.bg, fontSize: 11, fontFamily: 'Archivo_800ExtraBold' },
  checkText: { fontFamily: 'Archivo_400Regular', fontSize: 13, color: colors.text },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  monthCell: { width: 38, minHeight: 34, paddingHorizontal: 0, borderRadius: 8 },
  dateChip: { backgroundColor: colors.bg, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, paddingVertical: 8, paddingHorizontal: 12 },
  dateChipText: { fontFamily: 'Archivo_800ExtraBold', fontSize: 12.5, color: colors.accentRamp[700] },
  payOption: { flexDirection: 'row', gap: 12, padding: 12, borderWidth: 1, borderColor: colors.divider, borderRadius: 10, alignItems: 'flex-start' },
  radioOuter: { width: 20, height: 20, marginTop: 2, borderRadius: 10, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  radioInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.accent },
  payTitle: { fontFamily: 'Archivo_800ExtraBold', fontSize: 14, color: colors.text },
  payBody: { fontFamily: 'Archivo_400Regular', fontSize: 12, color: colors.neutral[600], marginTop: 2 },
});
