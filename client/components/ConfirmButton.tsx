import React from 'react';
import { TouchableOpacity, Text, StyleSheet, GestureResponderEvent } from 'react-native';

interface ConfirmButtonProps {
  title: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}

export default function ConfirmButton({ title, onPress, disabled = false }: ConfirmButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled}
    >
      <Text style={[styles.text, disabled && styles.textDisabled]}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    marginVertical: 6,
  },
  disabled: {
    backgroundColor: '#AAA',
  },
  text: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  textDisabled: {
    color: '#EEE',
  },
});