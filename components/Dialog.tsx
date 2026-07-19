import React from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { colors, radius, shadow, space } from '../theme';
import { Button, Txt } from './ui';

/** Centered confirm dialog on a scrim — matches the modernist .dialog. */
export function ConfirmDialog({
  visible,
  title,
  body,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  destructive,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  body?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable style={styles.backdrop} onPress={onCancel}>
        <Pressable style={[styles.dialog, shadow.lg]} onPress={(e) => e.stopPropagation()}>
          <Txt variant="h4">{title}</Txt>
          {body ? (
            <Txt variant="body" style={{ fontSize: 14, opacity: 0.85 }}>
              {body}
            </Txt>
          ) : null}
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="secondary" onPress={onCancel} minHeight={44} />
            <Button
              title={confirmLabel}
              variant="primary"
              minHeight={44}
              onPress={onConfirm}
              style={destructive ? { backgroundColor: colors.danger } : undefined}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.scrim, alignItems: 'center', justifyContent: 'center', padding: space[4] },
  dialog: { width: '88%', maxWidth: 320, backgroundColor: colors.surface, borderRadius: radius.lg, padding: space[4], gap: space[3] },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: space[2], marginTop: space[2] },
});
