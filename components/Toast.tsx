import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, shadow, space } from '../theme';
import { useStore } from '../store/store';

/**
 * Bottom toast — the prototype's every-action-gets-a-reaction feedback channel.
 * Sits just above the tab bar and slides/fades in (cb-toast keyframe).
 */
export function Toast() {
  const { toastMsg } = useStore();
  const insets = useSafeAreaInsets();
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (toastMsg) {
      Animated.timing(anim, { toValue: 1, duration: 250, useNativeDriver: true }).start();
    } else {
      Animated.timing(anim, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [toastMsg, anim]);

  if (!toastMsg) return null;
  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.toast,
        shadow.md,
        {
          bottom: insets.bottom + 78,
          opacity: anim,
          transform: [{ translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [8, 0] }) }],
        },
      ]}
    >
      <Text style={styles.text}>{toastMsg}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    left: space[4],
    right: space[4],
    zIndex: 70,
    backgroundColor: colors.text,
    paddingVertical: space[3],
    paddingHorizontal: space[4],
    borderRadius: radius.button,
  },
  text: { color: colors.bg, fontFamily: 'Archivo_600SemiBold', fontSize: 12.5, lineHeight: 17 },
});
