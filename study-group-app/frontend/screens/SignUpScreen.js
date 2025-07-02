import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import InputField    from '../components/InputField';
import PasswordInput from '../components/PasswordInput';
import AuthButton    from '../components/AuthButton';
import { spacing, colors, typography } from '../constants';

import { auth } from '../../backend/firebaseConfig';
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  updateProfile,
} from 'firebase/auth';

import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';

const SignUpScreen = ({ navigation }) => {
  const [fullName,        setFullName]        = useState('');
  const [email,           setEmail]           = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const isPasswordStrong = pw =>
    pw.length >= 8 &&
    /[A-Z]/.test(pw) &&
    /[a-z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw);

  const handleSignUp = async () => {
    const trimName  = fullName.trim();
    const trimEmail = email.trim().toLowerCase();
    const trimPass  = password.trim();
    const trimCPass = confirmPassword.trim();

    if (!trimName || !trimEmail || !trimPass || !trimCPass) {
      return Alert.alert('Error', 'Please fill out all fields.');
    }
    if (trimPass !== trimCPass) {
      return Alert.alert('Error', 'Passwords do not match.');
    }
    if (!isPasswordStrong(trimPass)) {
      return Alert.alert(
        'Error',
        'Password must be 8+ characters, include uppercase, lowercase, number, and symbol.'
      );
    }

    const domain = trimEmail.split('@')[1];
    if (!domain) {
      return Alert.alert('Error', 'Invalid email format.');
    }
    const domainRef  = doc(db, 'validDomains', domain);
    const domainSnap = await getDoc(domainRef);
    if (!domainSnap.exists()) {
      return Alert.alert(
        'Error',
        'This domain is not supported. Please use your university email.'
      );
    }
    const { name: universityName } = domainSnap.data();

    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        trimEmail,
        trimPass
      );
      await updateProfile(userCred.user, { displayName: trimName });
      await sendEmailVerification(userCred.user);

      // existing pendingVerifications record
      await setDoc(
        doc(db, 'pendingVerifications', userCred.user.uid),
        {
          email:     trimEmail,
          createdAt: serverTimestamp(),
        }
      );

      // create students/{uid} profile (flat collection)
      await setDoc(
        doc(db, 'students', userCred.user.uid),
        {
          uid:             userCred.user.uid,
          email:           trimEmail,
          displayName:     trimName,
          schoolId:        domain,
          universityName,    
          settings: {
            notifications: false,
          },
          createdAt:       serverTimestamp(),
          updatedAt:       serverTimestamp(),
        }
      );

      navigation.navigate('VerifyEmailScreen', { email: trimEmail });
    } catch (error) {
      console.error('SignUp error:', error);
      if (error.code === 'auth/email-already-in-use') {
        Alert.alert('Error', 'Email already in use.');
      } else {
        Alert.alert('Error', error.message);
      }
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
        placeholder="Enter your university email"
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

      <AuthButton label="Sign Up" onPress={handleSignUp} />

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
    flex:             1,
    paddingHorizontal: spacing.s5,
    justifyContent:   'center',
    backgroundColor:  colors.background,
  },
  title: {
    fontSize:     typography.font4Xl,
    fontWeight:   typography.fontWeightBold,
    textAlign:    'center',
    marginBottom: spacing.vs7,
  },
  label: {
    fontSize:     typography.fontSm,
    color:        colors.muted,
    marginBottom: spacing.s2,
  },
  footerTouch: {
    marginTop: spacing.vs5,
  },
  footerText: {
    textAlign: 'center',
    fontSize:  typography.fontMd,
    color:     colors.text,
  },
  link: {
    color:      colors.primary,
    fontWeight: typography.fontWeightBold,
  },
});

export default SignUpScreen;
