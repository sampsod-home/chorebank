import React from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { colors, radius, space } from '../theme';
import { useStore } from '../store/store';
import { PayCycleType, PayFreq } from '../lib/types';
import { cycleStats, DAYS, DAYS_MED, fmt, NEXT_DATE, ordinal, payFreqLabel } from '../lib/domain';
import { Card, Chip, Hr, Kicker, SegBar, Txt } from '../components/ui';

export function PaydayScreen() {
  const store = useStore();
  const { kids, payDay, payFreq, payMonthDay, payCycleType, currency } = store;

  const nextPayout =
    'Next payout ' +
    (payFreq === 'Monthly' ? 'the ' + ordinal(payMonthDay) + ' of the month' : DAYS_MED[payDay] + ' ' + NEXT_DATE[payDay]) +
    ' · ' +
    kids.map((k) => k.name + ' ' + fmt(k.balance, currency)).join(' · ');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Txt variant="h4" style={{ marginBottom: 4 }}>
        Allowance & payday
      </Txt>
      <Txt muted style={{ fontSize: 12.5, marginBottom: 14 }}>
        Allowance pays out {payFreqLabel(store)}. The weekly limit caps how much chore money each kid can be assigned.
      </Txt>

      {/* Weekly allowance limit per kid */}
      <Card style={{ marginBottom: 14 }} gap={10}>
        <Kicker>Weekly allowance limit · per kid</Kicker>
        {kids.map((k) => (
          <View key={k.id} style={styles.limitRow}>
            <Text style={styles.limitName}>{k.name}</Text>
            <Pressable style={styles.stepBtn} onPress={() => store.setKidLimit(k.id, Math.max(0, +(k.limit - 0.5).toFixed(2)))}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <View style={styles.limitInputWrap}>
              <Text style={styles.limitCurrency}>{currency}</Text>
              <TextInput
                value={String(k.limit)}
                keyboardType="decimal-pad"
                onChangeText={(t) => {
                  const v = parseFloat(t);
                  store.setKidLimit(k.id, isNaN(v) ? 0 : Math.max(0, v));
                }}
                style={styles.limitInput}
              />
            </View>
            <Pressable style={styles.stepBtn} onPress={() => store.setKidLimit(k.id, +(k.limit + 0.5).toFixed(2))}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        ))}
      </Card>

      {/* Pays out */}
      <Card style={{ marginBottom: 14 }} gap={10}>
        <Kicker>Pays out</Kicker>
        {payFreq === 'Monthly' ? (
          <View style={styles.monthGrid}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <Chip key={d} label={String(d)} active={payMonthDay === d} onPress={() => store.setPay({ payMonthDay: d })} style={styles.monthCell} />
            ))}
          </View>
        ) : (
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {DAYS.map((d, i) => (
              <Chip key={i} label={d} flex active={payDay === i} onPress={() => store.setPay({ payDay: i })} style={{ paddingHorizontal: 0 }} />
            ))}
          </View>
        )}
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Weekly', 'Every 2 weeks', 'Monthly'] as PayFreq[]).map((fr) => (
            <Chip key={fr} label={fr} flex active={payFreq === fr} onPress={() => store.setPay({ payFreq: fr })} style={{ paddingHorizontal: 4 }} />
          ))}
        </View>
        <Text style={styles.meta}>{nextPayout}</Text>
      </Card>

      <Hr />

      {/* Pay cycle */}
      <Txt variant="h4" style={{ marginBottom: 12 }}>
        Pay cycle
      </Txt>
      <View style={styles.tabRow}>
        {(['allowance', 'perChore'] as PayCycleType[]).map((id) => {
          const active = payCycleType === id;
          return (
            <Pressable key={id} onPress={() => store.setPay({ payCycleType: id })} style={styles.tabBtn}>
              <Text style={[styles.tabLabel, { color: active ? colors.accent : colors.text }]}>{id === 'allowance' ? 'Allowance' : 'Pay Per Chore'}</Text>
              <View style={[styles.tabRule, { backgroundColor: active ? colors.accent : 'transparent' }]} />
            </Pressable>
          );
        })}
      </View>

      {kids.map((k) => {
        const cs = cycleStats(store, k.id)[payCycleType];
        const pct = Math.min(100, cs.moneyPossible ? Math.round((cs.moneyEarned / cs.moneyPossible) * 100) : 0);
        return (
          <View key={k.id} style={styles.budgetRow}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={styles.budgetName}>{k.name}</Text>
              <Text style={styles.budgetMoney}>
                {fmt(cs.moneyEarned, currency)} of {fmt(cs.moneyPossible, currency)} earned
              </Text>
            </View>
            <Text style={styles.budgetChores}>
              {cs.choresDone} of {cs.choresTotal} chores completed
            </Text>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${pct}%` }]} />
            </View>
          </View>
        );
      })}
      <Txt muted style={{ fontSize: 11, marginTop: 10 }}>
        Marketplace extras don’t count against the weekly limit.
      </Txt>
      <View style={{ height: space[4] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[4] },
  limitRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  limitName: { flex: 1, fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
  stepBtn: { width: 38, height: 38, borderWidth: 1, borderColor: colors.divider, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  stepText: { fontFamily: 'Archivo_800ExtraBold', fontSize: 18, color: colors.text },
  limitInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: 10,
    paddingHorizontal: 8,
    width: 86,
    overflow: 'hidden',
  },
  limitCurrency: { fontFamily: 'Archivo_800ExtraBold', fontSize: 18, color: colors.text },
  limitInput: { flex: 1, minWidth: 0, fontFamily: 'Archivo_800ExtraBold', fontSize: 18, color: colors.text, textAlign: 'center', paddingVertical: 8 },
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  monthCell: { width: 38, minHeight: 34, paddingHorizontal: 0, borderRadius: 8 },
  meta: { fontFamily: 'Archivo_400Regular', fontSize: 11, color: colors.textMuted },
  tabRow: { flexDirection: 'row', gap: 18, marginBottom: 12 },
  tabBtn: { paddingBottom: 8 },
  tabLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 14 },
  tabRule: { height: 3, marginTop: 6, borderRadius: 2 },
  budgetRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: colors.divider, gap: 8 },
  budgetName: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, color: colors.text },
  budgetMoney: { fontFamily: 'Archivo_600SemiBold', fontSize: 13, color: colors.text },
  budgetChores: { fontFamily: 'Archivo_400Regular', fontSize: 12, color: colors.neutral[600] },
  track: { height: 6, backgroundColor: colors.neutral[200] },
  fill: { height: 6, backgroundColor: colors.accent },
});
