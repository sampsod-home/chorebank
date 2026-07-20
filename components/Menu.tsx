import React, { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, radius, shadow, space } from '../theme';
import { Icon } from './Icon';

export interface MenuItem {
  label: string;
  onPress: () => void;
  destructive?: boolean;
}

const MENU_W = 168;

/**
 * A "•••" trigger that opens a small popover menu anchored under it.
 * The button is measured on press so the menu drops from the button's
 * bottom-right, right-aligned to it. Tapping the backdrop dismisses.
 */
export function KebabMenu({ items, tint = colors.neutral[600] }: { items: MenuItem[]; tint?: string }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const ref = useRef<View>(null);

  const openMenu = () => {
    ref.current?.measureInWindow((x, y, w, h) => {
      setPos({ x: x + w, y: y + h });
      setOpen(true);
    });
  };

  return (
    <>
      <Pressable
        ref={ref}
        onPress={openMenu}
        accessibilityRole="button"
        accessibilityLabel="More options"
        hitSlop={8}
        style={({ pressed }) => [styles.trigger, pressed && { backgroundColor: colors.overlay07 }]}
      >
        <Icon name="more" size={20} color={tint} />
      </Pressable>

      <Modal transparent visible={open} animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          <View style={[styles.menu, shadow.lg, { top: pos.y + 4, left: Math.max(8, pos.x - MENU_W) }]}>
            {items.map((it, i) => (
              <Pressable
                key={i}
                onPress={() => {
                  setOpen(false);
                  it.onPress();
                }}
                style={({ pressed }) => [styles.item, i > 0 && styles.itemDivide, pressed && { backgroundColor: colors.overlay04 }]}
              >
                <Text style={[styles.itemText, it.destructive && { color: colors.danger }]}>{it.label}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: { width: 32, height: 32, borderRadius: radius.button, alignItems: 'center', justifyContent: 'center' },
  backdrop: { flex: 1 },
  menu: {
    position: 'absolute',
    width: MENU_W,
    backgroundColor: colors.bg,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.divider,
    overflow: 'hidden',
    paddingVertical: space[1],
  },
  item: { paddingVertical: space[3], paddingHorizontal: space[4] },
  itemDivide: { borderTopWidth: 1, borderTopColor: colors.divider },
  itemText: { fontFamily: 'Archivo_600SemiBold', fontSize: 14, color: colors.text },
});
