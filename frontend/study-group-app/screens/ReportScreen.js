import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';

export default function ReportScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Report illustration/icon */}
        <Ionicons
          name="alert-circle-outline"
          size={spacing.vs17}
          color={colors.primary}
          style={styles.icon}
        />

        {/* Title */}
        <Text style={styles.title}>Report</Text>

        {/* Report actions */}
        <View style={styles.actions}>
          <AuthButton
            label="Report User"
            onPress={() => {
              /* TODO: navigate to user-report flow */
            }}
            style={styles.button}
          />

          <AuthButton
            label="Report Group"
            onPress={() => {
              /* TODO: navigate to group-report flow */
            }}
            style={styles.button}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    padding: spacing.s4,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  icon: {
    marginTop: spacing.vs6,
    marginBottom: spacing.vs4,
  },
  title: {
    fontSize: typography.fontXxl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.vs6,
  },
  actions: {
    width: '100%',
  },
  button: {
    marginBottom: spacing.vs4,
    paddingVertical: spacing.vs3,
  },
});