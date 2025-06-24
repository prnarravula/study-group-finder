import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

export default function CalendarScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Calendar</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
    padding: spacing.s4,
  },
  text: {
    fontSize: typography.fontLg,
    color: colors.text,
  },
});