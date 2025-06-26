import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';  // ← import hook
import EditInfoModal from '../modals/EditInfoModal';
import { colors, typography, spacing } from '../constants';

const ProfileScreen = () => {
  const navigation = useNavigation();  // ← get navigation
  const [user, setUser] = useState({
    name: 'Pranav Narravula',
    email: 'john.doe@university.edu',
    phone: '',
  });
  const [modalVisible, setModalVisible] = useState(false);

  const handleSave = ({ name, email, phone }) => {
    setUser({ name, email, phone });
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Avatar */}
        <Ionicons
          name="person-circle-outline"
          size={spacing.vs17}
          color={colors.primary}
          style={styles.avatar}
        />

        {/* Name & Email */}
        <Text style={styles.name}>{user.name}</Text>
        <Text style={styles.email}>{user.email}</Text>

        {/* Last Verified row */}
        <View style={styles.row}>
          <Text style={styles.label}>Last Verified:</Text>
          <Text style={styles.value}>July 1, 2025</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('VerifyEmailScreen', { email: user.email })
            }
          >
            <Text style={styles.link}>Reverify</Text>
          </TouchableOpacity>
        </View>

        {/* Action Links */}
        <TouchableOpacity onPress={() => navigation.navigate('VerifyEmailScreen', { email: user.email })}>
          <Text style={styles.link}>Reset Password</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { /* handle logout */ }}>
          <Text style={styles.link}>Log Out</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { /* handle delete */ }}>
          <Text style={styles.link}>Delete Account</Text>
        </TouchableOpacity>

        {/* Edit Information link */}
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Text style={styles.link}>Edit Information</Text>
        </TouchableOpacity>
      </View>

      {/* Edit Information Modal */}
      <EditInfoModal
        visible={modalVisible}
        initialValues={user}
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
    marginBottom: spacing.vs6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.vs4,
  },
  label: {
    fontSize: typography.fontLg,
    color: colors.text,
  },
  value: {
    fontSize: typography.fontLg,
    color: colors.text,
    marginHorizontal: spacing.s2,
  },
  link: {
    fontSize: typography.fontLg,
    color: colors.primary,
    marginVertical: spacing.vs2,
    textAlign: 'center',
  },
});

export default ProfileScreen;