import React from 'react';
import { Text, TextStyle } from 'react-native';
import { colors } from '../theme';

/** The CHORE·BANK wordmark — "BANK" in accent, matching the prototype. */
export function Wordmark({ size = 19 }: { size?: number }) {
  const base: TextStyle = { fontFamily: 'Archivo_800ExtraBold', fontSize: size, letterSpacing: -0.015 * size };
  return (
    <Text style={base}>
      <Text style={{ color: colors.text }}>CHORE</Text>
      <Text style={{ color: colors.accent }}>BANK</Text>
    </Text>
  );
}
