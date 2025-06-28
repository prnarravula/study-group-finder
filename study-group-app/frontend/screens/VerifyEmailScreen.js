import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';

const VerifyEmailScreen = ({ route, navigation }) => {
  const { email } = route.params;

  const handleRefresh = () => {
    // Simulate successful verification for frontend flow
    navigation.replace('BottomNavBar');
  };

  return (
    <View style={styles.container}>
      <Ionicons
        name="mail-unread-outline"
        size={spacing.s15}
        color={colors.primary}
      />

      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Check your inbox ({email}) to verify your account (Check Spam).
      </Text>

      <View style={styles.buttonContainer}>
        <AuthButton
          label="Refresh"
          onPress={handleRefresh}
          style={{ marginTop: spacing.vs6 }}
        />
      </View>

      <TouchableOpacity onPress={() => {}} activeOpacity={0.6}>
        <Text style={styles.link}>Resend Email</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.6}>
        <Text style={styles.link}>Cancel</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.s4,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: spacing.vs4,
    fontSize: typography.fontXxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    marginTop: spacing.vs2,
    fontSize: typography.fontLg,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  buttonContainer: {
    width: '100%',
  },
  link: {
    marginTop: spacing.vs3,
    fontSize: typography.fontMd,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default VerifyEmailScreen;
