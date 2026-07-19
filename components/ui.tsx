import React from 'react';
import {
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import { colors, radius, shadow, space, type as typo } from '../theme';

// ── Text ─────────────────────────────────────────────────────────────────────
type Variant = keyof typeof typo;
interface TxtProps extends TextProps {
  variant?: Variant;
  color?: string;
  muted?: boolean;
  weight?: 'regular' | 'semibold' | 'heading';
}
export function Txt({ variant = 'body', color, muted, weight, style, ...rest }: TxtProps) {
  const base = typo[variant] as TextStyle;
  const fam = weight ? { fontFamily: { regular: 'Archivo_400Regular', semibold: 'Archivo_600SemiBold', heading: 'Archivo_800ExtraBold' }[weight] } : null;
  return (
    <Text
      style={[base, { color: muted ? colors.textMuted : color ?? colors.text }, fam, style]}
      {...rest}
    />
  );
}

// ── Button ───────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost';
interface BtnProps extends Omit<PressableProps, 'style' | 'children'> {
  title?: string;
  variant?: BtnVariant;
  block?: boolean;
  disabled?: boolean;
  minHeight?: number;
  iconLeft?: React.ReactNode;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  textColor?: string;
  align?: 'center' | 'flex-start';
}
export function Button({
  title,
  variant = 'secondary',
  block,
  disabled,
  minHeight = 40,
  iconLeft,
  children,
  style,
  textColor,
  align = 'center',
  ...rest
}: BtnProps) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        { minHeight, justifyContent: block ? 'flex-start' : align },
        block && styles.btnBlock,
        variant === 'primary' && { backgroundColor: pressed ? colors.accentRamp[700] : colors.accent },
        variant === 'secondary' && {
          borderColor: colors.divider,
          backgroundColor: pressed ? colors.overlay14 : 'transparent',
        },
        variant === 'ghost' && { backgroundColor: pressed ? 'rgba(236,48,19,0.18)' : 'transparent' },
        disabled && { opacity: 0.45 },
        style,
      ]}
      {...rest}
    >
      {iconLeft}
      {(title || children) && (
        <Text
          style={[
            styles.btnLabel,
            {
              color:
                textColor ??
                (variant === 'primary' ? colors.bg : variant === 'ghost' ? colors.accent : colors.text),
            },
          ]}
        >
          {title}
          {children}
        </Text>
      )}
    </Pressable>
  );
}

/** Icon-only ghost button (the pencil/trash/plus row actions). */
export function IconButton({
  onPress,
  children,
  size = 32,
  disabled,
  accessibilityLabel,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  size?: number;
  disabled?: boolean;
  accessibilityLabel?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        { width: size, height: size, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
        pressed && { backgroundColor: colors.overlay07 },
        disabled && { opacity: 0.45 },
      ]}
    >
      {children}
    </Pressable>
  );
}

// ── Card ─────────────────────────────────────────────────────────────────────
export function Card({
  children,
  style,
  elevated = true,
  gap = space[2],
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  elevated?: boolean;
  gap?: number;
}) {
  return <View style={[styles.card, { gap }, elevated && shadow.sm, style]}>{children}</View>;
}

export function Kicker({ children, color }: { children: React.ReactNode; color?: string }) {
  return <Text style={[styles.kicker, color ? { color } : null]}>{children}</Text>;
}

// ── Tag ──────────────────────────────────────────────────────────────────────
type TagVariant = 'accent' | 'neutral' | 'outline' | 'success' | 'warning' | 'danger';
export function Tag({ children, variant = 'neutral' }: { children: React.ReactNode; variant?: TagVariant }) {
  const map: Record<TagVariant, { bg: string; fg: string; border?: string }> = {
    accent: { bg: colors.accentRamp[100], fg: colors.accentRamp[800] },
    neutral: { bg: colors.neutral[100], fg: colors.neutral[800] },
    outline: { bg: 'transparent', fg: colors.accent, border: colors.accent },
    success: { bg: colors.successBg, fg: colors.successText },
    warning: { bg: colors.warningBg, fg: colors.warningText },
    danger: { bg: colors.dangerBg, fg: colors.dangerText },
  };
  const t = map[variant];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }, t.border ? { borderWidth: 1, borderColor: t.border } : null]}>
      <Text style={[styles.tagText, { color: t.fg }]}>{children}</Text>
    </View>
  );
}

// ── Field + Input ────────────────────────────────────────────────────────────
export function Field({ label, children, style }: { label?: string; children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      {children}
    </View>
  );
}

export function Input({ style, multiline, ...rest }: TextInputProps) {
  return (
    <TextInput
      placeholderTextColor={colors.textMuted}
      style={[styles.input, multiline && { minHeight: 64, textAlignVertical: 'top', paddingTop: 8 }, style]}
      multiline={multiline}
      {...rest}
    />
  );
}

// ── Switch (the modernist pill toggle) ───────────────────────────────────────
export function Toggle({ value, onValueChange }: { value: boolean; onValueChange: (v: boolean) => void }) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      style={[styles.switchTrack, { backgroundColor: value ? colors.accent : colors.neutral[300] }]}
    >
      <View style={[styles.switchKnob, { left: value ? 22 : 2 }]} />
    </Pressable>
  );
}

// ── Chip / Segment ───────────────────────────────────────────────────────────
export function Chip({
  label,
  active,
  onPress,
  disabled,
  bordered = true,
  style,
  flex,
}: {
  label: string;
  active: boolean;
  onPress?: () => void;
  disabled?: boolean;
  bordered?: boolean;
  style?: StyleProp<ViewStyle>;
  flex?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.chip,
        flex && { flex: 1 },
        bordered && { borderWidth: 1, borderColor: colors.divider },
        { backgroundColor: active ? colors.accent : 'transparent' },
        pressed && !active && { backgroundColor: colors.overlay07 },
        disabled && { opacity: 0.45 },
        style,
      ]}
    >
      <Text style={[styles.chipLabel, { color: active ? colors.bg : colors.text }]}>{label}</Text>
    </Pressable>
  );
}

/** A joined segmented control (chips inside one bordered, rounded container). */
export function SegBar({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.segBar, style]}>{children}</View>;
}

// ── Divider ──────────────────────────────────────────────────────────────────
export function Hr({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.hr, style]} />;
}

const styles = StyleSheet.create({
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: space[2],
    paddingHorizontal: space[3] * 1.2,
    borderRadius: radius.button,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  btnBlock: { width: '100%', marginTop: space[2], paddingHorizontal: space[3] },
  btnLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 14, lineHeight: 17 },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: space[3] },
  kicker: { fontFamily: 'Archivo_800ExtraBold', fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', color: colors.accent },
  tag: { alignSelf: 'flex-start', paddingVertical: 3, paddingHorizontal: 10, borderRadius: radius.md * 0.75 },
  tagText: { fontFamily: 'Archivo_600SemiBold', fontSize: 11, letterSpacing: 0.2 },
  label: { fontFamily: 'Archivo_400Regular', fontSize: 12, marginBottom: 5, color: colors.labelMuted },
  input: {
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontFamily: 'Archivo_400Regular',
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.divider,
    borderRadius: radius.input,
  },
  switchTrack: { width: 46, height: 26, borderRadius: 13, justifyContent: 'center' },
  switchKnob: { position: 'absolute', top: 2, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  chip: {
    minHeight: 40,
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderRadius: radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipLabel: { fontFamily: 'Archivo_800ExtraBold', fontSize: 12.5 },
  segBar: { flexDirection: 'row', borderWidth: 1, borderColor: colors.divider, borderRadius: radius.md, overflow: 'hidden' },
  hr: { height: 2, backgroundColor: colors.divider, marginVertical: space[4] },
});
