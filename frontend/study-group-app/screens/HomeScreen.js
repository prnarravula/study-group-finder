import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppIcon from '../components/AppIcon';
import SignUpButton from '../components/SignUpButton';
import LogInButton from '../components/LogInButton';
import { spacing, colors } from '../constants';
import typography from '../constants/typography';

const HomeScreen = () => (
  <View style={styles.container}>
    <View style={styles.centerBlock}>
      <AppIcon />
      <Text style={styles.title}>Welcome to{"\n"}StudyGroup</Text>
      <Text style={styles.tagline}>
        Find classmates. Form groups.{"\n"}Study better together.
      </Text>
      <View style={styles.buttonBlock}>
        <SignUpButton />
        <LogInButton />
      </View>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    justifyContent: 'center',  
    alignItems: 'center',  
    paddingHorizontal: spacing.s4,
  },
  centerBlock: {
    alignItems: 'center',
    gap: spacing.vs3,
  },
  title: {
    fontSize: typography.fontXxl,
    fontWeight: typography.fontWeightBold,
    color: colors.textPrimary,
    textAlign: 'center',
  },
  tagline: {
    fontSize: typography.fontLg,
    fontWeight: typography.fontWeightRegular,
    color: colors.textSecondary || '#4a4a4a',
    textAlign: 'center',
    marginTop: spacing.vs2,
    width: '80%',
    marginBottom: spacing.vs15
  },
  buttonBlock: {
    marginTop: spacing.vs1,
    width: '80%',
    alignItems: 'center',
  },
});

export default HomeScreen;
