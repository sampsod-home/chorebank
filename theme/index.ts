/**
 * ChoreBank theme — ported from the "modernist" design system (modernist.css).
 *
 * Translation notes for React Native:
 *  - CSS `color-mix(in srgb, X n%, transparent)` has no RN equivalent, so those
 *    tokens are expressed as `rgba()` (RN supports rgba strings natively).
 *  - CSS custom properties become plain TS values; the token *names* are kept
 *    close to the CSS so the prototype stays easy to cross-reference.
 *  - Radius uses the prototype's local overrides (8/12/18, button/input 10),
 *    not the base modernist `0px`, because that rounded look is the real design.
 *  - Semantic colors (success/warning/danger/info) are ADDED — the prototype
 *    leaned entirely on the single accent, which the design principles flag as
 *    a gap for status meaning. They're tuned warm to sit with the neutral ramp.
 */

// text #201e1d as rgb → 32,30,29
const INK = '32,30,29';

export const colors = {
  bg: '#f3f2f2',
  surface: '#eae9e9',
  text: '#201e1d',
  accent: '#ec3013',
  accent2: '#e15b47',

  // transparency tokens (were color-mix with transparent)
  divider: `rgba(${INK},0.40)`,
  textMuted: `rgba(${INK},0.55)`,
  labelMuted: `rgba(${INK},0.70)`, // .field > label
  overlay04: `rgba(${INK},0.04)`, // subtle row hover
  overlay07: `rgba(${INK},0.07)`, // secondary btn hover
  overlay14: `rgba(${INK},0.14)`, // secondary btn active
  scrim: 'rgba(45,43,43,0.50)', // dialog backdrop (neutral-900 @ 50%)

  neutral: {
    100: '#f8f4f4',
    200: '#eae7e7',
    300: '#d7d3d3',
    400: '#bab6b6',
    500: '#9b9797',
    600: '#7d7979',
    700: '#605d5d',
    800: '#444141',
    900: '#2d2b2b',
  },
  accentRamp: {
    100: '#fff2ef',
    200: '#ffe0d9',
    300: '#ffc4b8',
    400: '#ff9783',
    500: '#ff563c',
    600: '#dd2b0f',
    700: '#ae1800',
    800: '#7c1405',
    900: '#4d170e',
  },
  accent2Ramp: {
    100: '#fff2ef',
    200: '#ffe0da',
    300: '#ffc4b9',
    400: '#ff9784',
    500: '#ef6853',
    600: '#c94b39',
    700: '#9e3526',
    800: '#71261b',
    900: '#471d16',
  },

  // ── Semantic (added; applies design principles' green/red/yellow) ──
  // Kept slightly warm so they harmonize with the brownish neutral ramp.
  success: '#1f7a4d',
  successBg: '#e3f1ea',
  successText: '#155c39',
  warning: '#b7791f',
  warningBg: '#f9efd9',
  warningText: '#87590f',
  danger: '#b3261e', // cooler/deeper than the orange accent, so "destructive" reads distinct
  dangerBg: '#fbe6e3',
  dangerText: '#851a13',
  info: '#2563a8',
  infoBg: '#e4eef8',
  infoText: '#1a4a80',

  white: '#ffffff',
} as const;

// 4-point spacing scale (space-1..8)
export const space = {
  1: 4,
  2: 8,
  3: 12,
  4: 16,
  6: 24,
  8: 32,
} as const;

// Radius — prototype's rounded overrides
export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  button: 10,
  input: 10,
  pill: 999,
} as const;

// Archivo weights map to the loaded font families
export const font = {
  regular: 'Archivo_400Regular',
  semibold: 'Archivo_600SemiBold',
  heading: 'Archivo_800ExtraBold', // --font-heading-weight: 800
} as const;

/**
 * Type scale from modernist.css. RN needs absolute lineHeight, so the CSS
 * unitless line-heights are multiplied out. Headings: -0.015em letter-spacing
 * (≈ -0.15 * fontSize) and 1.12 line-height.
 */
export const type = {
  body: { fontFamily: font.regular, fontSize: 15, lineHeight: 23 },
  h1: { fontFamily: font.heading, fontSize: 42, lineHeight: 47, letterSpacing: -0.63 },
  h2: { fontFamily: font.heading, fontSize: 32, lineHeight: 36, letterSpacing: -0.48 },
  h3: { fontFamily: font.heading, fontSize: 25, lineHeight: 28, letterSpacing: -0.38 },
  h4: { fontFamily: font.heading, fontSize: 20, lineHeight: 22, letterSpacing: -0.3 },
  h5: { fontFamily: font.heading, fontSize: 16, lineHeight: 18, letterSpacing: -0.24 },
  // h6 is the small uppercase kicker used all over the prototype
  h6: {
    fontFamily: font.heading,
    fontSize: 13,
    lineHeight: 15,
    letterSpacing: 1.04, // 0.08em
    textTransform: 'uppercase' as const,
  },
} as const;

/**
 * Elevation — modernist shadows converted to RN shadow props.
 * shadowColor is neutral-900 (#2d2b2b) as in the CSS.
 */
export const shadow = {
  sm: {
    shadowColor: '#2d2b2b',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.14,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: '#2d2b2b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#2d2b2b',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
} as const;

export const theme = { colors, space, radius, font, type, shadow };
export type Theme = typeof theme;
