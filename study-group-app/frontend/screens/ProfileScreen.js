import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import EditInfoModal from '../modals/EditInfoModal';
import { colors, typography, spacing } from '../constants';

// backend
import { signOut, deleteUser, sendPasswordResetEmail, updateProfile } from 'firebase/auth';
import { auth, db } from '../../backend/firebaseConfig';

const ProfileScreen = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);
  const currentUser = auth.currentUser;

  const handleSave = async ({ name }) => {
    try {
      await updateProfile(currentUser, { displayName: name });
      alert('Name updated!');
    } catch (error) {
      alert('Failed to update name: ' + error.message);
    }
    setModalVisible(false);
  };

  const handleReset = async () => {
    try {
      await sendPasswordResetEmail(auth, currentUser.email);
      alert('Reset email sent. Check your inbox or spam.');
    } catch (error) {
      alert('Error: ' + error.message);
    }
  };

  const handleLogOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      alert('Error signing out: ' + error.message);
    }
  };

const handleDeleteAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    Alert.alert("No user is currently signed in.");
    return;
  }

  Alert.alert(
    "Confirm Deletion",
    "Are you sure you want to delete your account? This cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            // 1️⃣ Delete the Firestore student doc
            await deleteDoc(doc(db, 'students', user.uid));

            // 2️⃣ Delete the Firebase Auth user
            await deleteUser(user);

            Alert.alert("Your account and profile have been deleted.");
          } catch (error) {
            if (error.code === 'auth/requires-recent-login') {
              Alert.alert("Please log in again to delete your account.");
            } else {
              Alert.alert("Error deleting account: " + error.message);
            }
          }
        },
      },
    ]
  );
};

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Ionicons
          name="person-circle-outline"
          size={spacing.vs17}
          color={colors.primary}
          style={styles.avatar}
        />

        <Text style={styles.name}>{currentUser?.displayName || 'Unnamed User'}</Text>
        <Text style={styles.email}>{currentUser?.email || 'No email'}</Text>

        <TouchableOpacity onPress={handleReset}>
          <Text style={styles.link}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleLogOut}>
          <Text style={styles.link}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleDeleteAccount}>
          <Text style={styles.link}>Delete Account</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.link}>Edit Information</Text>
        </TouchableOpacity>
      </View>

      <EditInfoModal
        visible={modalVisible}
        initialValues={{
          name: currentUser?.displayName || '',
          email: currentUser?.email || '',
          phone: '',
        }}
        onSubmit={handleSave}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing.s4,
  },
  avatar: {
    marginBottom: spacing.vs4,
  },
  name: {
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing.vs2,
  },
  email: {
    fontSize: typography.fontXl,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.vs3,
  },
  link: {
    fontSize: typography.fontLg,
    color: colors.primary,
    marginVertical: spacing.vs2,
    textAlign: 'center',
  },
});

export default ProfileScreen;
