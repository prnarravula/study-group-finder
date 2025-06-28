import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';
import { auth } from '../../backend/firebaseConfig.js';
import { sendEmailVerification, signInWithEmailAndPassword } from 'firebase/auth';

const VerifyEmailScreen = ({ route, navigation }) => {
  const { email } = route.params;

  const handleRefresh = async() => {
    try {
      await auth.currentUser.reload()
      if(auth.currentUser.emailVerified){
        navigation.replace('BottomNavBar')
      }else{
        alert('Your email is still not verified. Please check your inbox or spam folder.');
      }
    } catch (error){
      alert('Something went wrong. Try again after a minute')
    }
  };
  
  const resendEmail = async() => {
    try {
      await auth.currentUser.reload()
      if(auth.currentUser.emailVerified){
        alert('Already verified!')
        return navigation.replace('BottomNavBar')
      }
    } catch (error){
      return
    }

    try {
      await sendEmailVerification(auth.currentUser)
      alert('Verification email resent. Check your inbox or spam folder. (Note that the link says that it expired even though it did not)')
    } catch (error) {
      alert('Failed to resend verification email: ' + error.message)
    }
  }



  return (
    <View style={styles.container}>
      <Ionicons
        name="mail-unread-outline"
        size={spacing.s15}
        color={colors.primary}
      />

      <Text style={styles.title}>Verify Your Email</Text>
      <Text style={styles.subtitle}>
        Check your inbox ({email}) to verify your account (Check spam and/or wait a minute).
      </Text>

      <View style={styles.buttonContainer}>
        <AuthButton
          label="Refresh"
          onPress={handleRefresh}
          style={{ marginTop: spacing.vs6 }}
        />
      </View>

      <TouchableOpacity onPress={resendEmail} activeOpacity={0.6}>
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
