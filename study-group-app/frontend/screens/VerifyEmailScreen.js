import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';
import { auth } from '../../backend/firebaseConfig';
import { sendEmailVerification } from 'firebase/auth';
import { AuthContext } from '../../backend/AuthContext';

const VerifyEmailScreen = () => {
  const { user, refreshUser } = useContext(AuthContext);
  const email = user?.email;

  const handleRefresh = async () => {
    try {
      await refreshUser();
      if (auth.currentUser.emailVerified) {
        // No need to navigate — App will re-render and redirect to BottomNavBar
      } else {
        alert('Email is still not verified. Try again after a moment.');
      }
    } catch (error) {
      alert('Something went wrong: ' + error.message);
    }
  };

const resendEmail = async () => {
  try {
    await refreshUser();    
    if (auth.currentUser?.emailVerified) {
      alert('Already verified!');
      return;
    }

    await sendEmailVerification(auth.currentUser);
    alert('Verification email sent. Check your inbox or spam folder.');
  } catch (error) {
    if (error.code === 'auth/too-many-requests') {
      alert('You’ve requested too many verification emails. Please wait a few minutes and try again.');
    } else {
      alert(`Failed to send verification email: ${error.message}`);
    }
  }
};

  return (
    <View style={styles.container}>
      <Ionicons name="mail-unread-outline" size={spacing.s15} color={colors.primary} />
      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Check your inbox ({email}) and click the verification link. Then tap Refresh below.
      </Text>

      <View style={styles.buttonContainer}>
        <AuthButton label="Refresh" onPress={handleRefresh} />
      </View>

      <TouchableOpacity onPress={resendEmail} activeOpacity={0.6}>
        <Text style={styles.link}>Resend Email</Text>
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
    fontSize: typography.fontXxl,
    fontWeight: 'bold',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontLg,
    color: colors.textSecondary,
    textAlign: 'center',
    marginVertical: spacing.vs2,
  },
  buttonContainer: {
    width: '100%',
    marginTop: spacing.vs4,
  },
  link: {
    marginTop: spacing.vs3,
    fontSize: typography.fontMd,
    color: colors.primary,
    textDecorationLine: 'underline',
  },
});

export default VerifyEmailScreen;
