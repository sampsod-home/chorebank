import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, space } from '../theme';
import { useStore } from '../store/store';
import { fmt, valueLabel, weekSum } from '../lib/domain';
import { Button, Card, Hr, Kicker, Txt } from '../components/ui';

export function HomeScreen() {
  const store = useStore();
  const { chores, kids, activity, currency } = store;

  const pending = chores.filter((c) => c.status === 'pending');

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      {/* ── Needs your OK ── */}
      <View style={styles.sectionHead}>
        <Text style={styles.h6}>NEEDS YOUR OK</Text>
        {pending.length > 0 && <Text style={[styles.h6, { color: colors.accent }]}>({pending.length})</Text>}
      </View>

      {pending.length === 0 ? (
        <Txt variant="body" muted style={{ fontSize: 13 }}>
          Nothing waiting — the kids are on it.
        </Txt>
      ) : (
        pending.map((c) => {
          const kid = kids.find((k) => k.id === c.kid);
          return (
            <Card key={c.id} style={{ marginBottom: space[2] + 2 }} gap={space[2]}>
              <Kicker>{kid?.name} says it&apos;s done</Kicker>
              <View style={styles.rowBetween}>
                <Txt variant="h5" style={{ flex: 1 }}>
                  {c.title}
                </Txt>
                <Text style={styles.money}>{valueLabel(c, currency)}</Text>
              </View>
              <View style={{ flexDirection: 'row', gap: space[2] }}>
                <Button
                  title="Approve & pay"
                  variant="primary"
                  block
                  minHeight={44}
                  style={{ flex: 1, marginTop: 0 }}
                  onPress={() => store.approve(c.id)}
                />
                <Button title="Redo" variant="secondary" minHeight={44} onPress={() => store.redo(c.id)} />
              </View>
            </Card>
          );
        })
      )}

      <Hr />

      {/* ── Wallets ── */}
      <Text style={[styles.h6, { marginBottom: space[1] }]}>WALLETS</Text>
      {kids.map((k) => {
        const total = chores.filter((c) => c.kid === k.id && c.active !== false).length;
        const done = chores.filter((c) => c.kid === k.id && c.active !== false && c.status !== 'todo').length;
        return (
          <View key={k.id} style={styles.walletRow}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{k.name[0]}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.walletName}>{k.name}</Text>
              <Text style={styles.walletSub}>
                {done} of {total} done today
              </Text>
            </View>
            <Text style={styles.walletBalance}>{fmt(k.balance, currency)}</Text>
          </View>
        );
      })}

      <Hr />

      {/* ── Activity ── */}
      <Text style={[styles.h6, { marginBottom: space[1] }]}>ACTIVITY</Text>
      {activity.map((a, i) => (
        <View key={i} style={styles.activityRow}>
          <Text style={styles.activityText}>{a.text}</Text>
          <Text style={[styles.activityAmt, { color: a.amt[0] === '+' ? colors.accentRamp[700] : colors.neutral[700] }]}>
            {a.amt}
          </Text>
          <Text style={styles.activityTime}>{a.time}</Text>
        </View>
      ))}
      <View style={{ height: space[4] }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: space[4] + 4, paddingTop: space[4] + 2 },
  sectionHead: { flexDirection: 'row', gap: 6, marginBottom: 10 },
  h6: { fontFamily: 'Archivo_800ExtraBold', fontSize: 13, letterSpacing: 1, textTransform: 'uppercase', color: colors.text },
  rowBetween: { flexDirection: 'row', alignItems: 'baseline', gap: 10 },
  money: { fontFamily: 'Archivo_800ExtraBold', fontSize: 17, color: colors.accentRamp[700] },
  walletRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space[3],
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  avatar: { width: 36, height: 36, backgroundColor: colors.text, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'Archivo_800ExtraBold', fontSize: 17, color: colors.bg },
  walletName: { fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
  walletSub: { fontFamily: 'Archivo_400Regular', fontSize: 11.5, color: colors.neutral[600], marginTop: 1 },
  walletBalance: { fontFamily: 'Archivo_800ExtraBold', fontSize: 18, color: colors.text },
  activityRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 10,
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: colors.divider,
  },
  activityText: { flex: 1, fontFamily: 'Archivo_400Regular', fontSize: 12.5, color: colors.text },
  activityAmt: { fontFamily: 'Archivo_600SemiBold', fontSize: 12.5 },
  activityTime: { fontFamily: 'Archivo_400Regular', fontSize: 11, color: colors.textMuted },
});
