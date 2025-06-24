import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import InputField            from '../components/InputField';
import PasswordInput         from '../components/PasswordInput';
import AuthButton            from '../components/AuthButton';
import ResetPasswordModal    from '../modals/ResetPasswordModal';
import { spacing, colors, typography } from '../constants';

const LogInScreen = ({ navigation }) => {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [showForgot, setShowForgot] = useState(false);

  const handleLogIn = () => {
    // TODO: replace with real backend auth
    navigation.navigate('VerifyEmailScreen', { email });
  };

  const handleReset = (forgotEmail) => {
    // TODO: call your reset-password API with forgotEmail
    navigation.navigate('VerifyEmailScreen', { email: forgotEmail });
    setShowForgot(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log In</Text>

      <Text style={styles.label}>Email</Text>
      <InputField
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <Text style={styles.label}>Password</Text>
      <PasswordInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <AuthButton
        label="Log In"
        onPress={handleLogIn}
        style={styles.button}
        textStyle={styles.buttonText}
      />

      <TouchableOpacity
        onPress={() => setShowForgot(true)}
        style={styles.forgotTouch}
      >
        <Text style={styles.forgotText}>Forgot password?</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate('SignUpScreen')}
        style={styles.footerTouch}
      >
        <Text style={styles.footerText}>
          Don't have an account?{' '}
          <Text style={styles.link}>Sign Up</Text>
        </Text>
      </TouchableOpacity>

      <ResetPasswordModal
        visible={showForgot}
        onClose={() => setShowForgot(false)}
        onReset={handleReset}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: spacing.s5,
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  title: {
    fontSize: typography.font4Xl,
    fontWeight: typography.fontWeightBold,
    textAlign: 'center',
    marginBottom: spacing.vs7,
  },
  label: {
    fontSize: typography.fontSm,
    color: colors.muted,
    marginBottom: spacing.s2,
  },
  button: {
    paddingVertical: spacing.vs5,
    borderRadius: spacing.s5,
    marginTop: spacing.vs4,
  },
  buttonText: {
    fontSize: typography.fontLg,
    fontWeight: typography.fontWeightBold,
  },
  forgotTouch: {
    marginTop: spacing.vs1,
    alignSelf: 'flex-end',
  },
  forgotText: {
    color: colors.primary,
    fontSize: typography.fontMd,
  },
  footerTouch: {
    marginTop: spacing.vs6,
    alignSelf: 'center',
  },
  footerText: {
    fontSize: typography.fontMd,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
});

export default LogInScreen;
