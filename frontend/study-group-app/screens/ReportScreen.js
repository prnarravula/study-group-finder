import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

export default function ReportScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Report</Text>
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