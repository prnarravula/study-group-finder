import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import AppIcon from '../components/AppIcon';
import AuthButton from '../components/AuthButton';
import { spacing, colors, typography } from '../constants';

const HomeScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <View style={styles.centerBlock}>
        <AppIcon />

        <Text style={styles.title}>
          Welcome to{'\n'}StudyGroup
        </Text>
        <Text style={styles.tagline}>
          Find classmates. Form groups.{'\n'}Study better together.
        </Text>

        <View style={styles.buttonBlock}>
          <AuthButton
            label="Sign Up"
            onPress={() => navigation.navigate('SignUpScreen')}
            style={styles.button}
            textStyle={styles.buttonText}
          />
          <AuthButton
            label="Log In"
            onPress={() => navigation.navigate('LogInScreen')}
            style={styles.button}
            textStyle={styles.buttonText}
          />
        </View>
      </View>
    </View>
  );
};

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
    width: '100%',
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
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.vs2,
    width: '80%',
    marginBottom: spacing.vs15,
  },
  buttonBlock: {
    marginTop: spacing.vs1,
    width: '80%',
    alignItems: 'stretch',
  },
  button: {
    width: '100%',
    paddingVertical: spacing.vs5,
    borderRadius: spacing.s5,
  },
  buttonText: {
    fontSize: typography.fontLg,
    fontWeight: typography.fontWeightBold,
  },
});

export default HomeScreen;