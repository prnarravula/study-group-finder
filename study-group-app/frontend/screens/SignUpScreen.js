import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import InputField   from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import AuthButton    from '../components/AuthButton';
import { spacing, colors, typography } from '../constants';
import { auth } from '../../backend/firebaseConfig.js';
import { createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';

const SignUpScreen = ({ navigation }) => {
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isPasswordStrong = (pw) => {
    return pw.length >= 8 &&
          /[A-Z]/.test(pw) &&  
          /[a-z]/.test(pw) && 
          /[0-9]/.test(pw) &&  
          /[^A-Za-z0-9]/.test(pw);
  };

  const trimName = fullName.trim();
  const trimEmail = email.trim();
  const trimPassword = password.trim();
  const trimcPassword = confirmPassword.trim();

  const handleSignUp = async () => {
    if(!trimName || !trimEmail || !trimPassword || !trimcPassword){
      return alert('Fill out all fields');
    }else if(trimEmail.includes(' ') || trimPassword.includes(' ') || trimcPassword.includes(' ')){
      return alert('Remove spaces from passwords/emails');
    }else if(trimPassword !== trimcPassword){
      return alert('Passwords do not match');
    }else if(!isPasswordStrong(trimPassword)) {
      return alert('Password must be 8+ characters, include uppercase, lowercase, number, and symbol');
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, trimEmail, trimPassword);
      await sendEmailVerification(userCredential.user);
      navigation.navigate('VerifyEmailScreen', { email: trimEmail });
    } catch (error) {
      alert(error.message);
    }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Sign Up</Text>

      <Text style={styles.label}>Full Name</Text>
      <InputField
        placeholder="Enter your full name"
        value={fullName}
        onChangeText={setFullName}
      />

      <Text style={styles.label}>Email</Text>
      <InputField
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Text style={styles.label}>Password</Text>
      <PasswordInput
        placeholder="Enter your password"
        value={password}
        onChangeText={setPassword}
      />

      <Text style={styles.label}>Confirm Password</Text>  
      <PasswordInput
        placeholder="Re-enter your password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {/* ← use AuthButton here */}
      <AuthButton
        label="Sign Up"
        onPress={handleSignUp}
      />

      <TouchableOpacity
        onPress={() => navigation.navigate('LogInScreen')}
        style={styles.footerTouch}
      >
        <Text style={styles.footerText}>
          Already have an account?{' '}
          <Text style={styles.link}>Log In</Text>
        </Text>
      </TouchableOpacity>
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
  footerTouch: {
    marginTop: spacing.vs5,
  },
  footerText: {
    textAlign: 'center',
    fontSize: typography.fontMd,
    color: colors.text,
  },
  link: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
  },
});

export default SignUpScreen;
