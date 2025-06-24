import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import GroupModal from '../modals/GroupModal';
import { colors, typography, spacing } from '../constants';

const YourGroupsScreen = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCreateSubmit = (data) => {
    // TODO: send `data` to your backend
    console.log('Creating group with:', data);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Your Groups</Text>

        {/* Placeholder for group items (will be replaced) */}
        <View style={styles.placeholder} />

        {/* Action buttons */}
        <View style={styles.buttonRow}>
          <AuthButton
            label="Create Group"
            onPress={() => setModalVisible(true)}
            style={styles.createBtn}
          />
          <AuthButton
            label="Join Group"
            onPress={() => navigation.navigate('JoinGroup')}
            style={styles.joinBtn}
            textStyle={{ color: colors.primary }}
          />
        </View>
      </ScrollView>

      {/* Create/Edit Group Modal */}
      <GroupModal
        visible={modalVisible}
        mode="create"
        initialValues={{ name: '', subject: '', description: '', count: 1, enabled: false }}
        onSubmit={handleCreateSubmit}
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
    flexGrow: 1,
    justifyContent: 'space-between',
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.vs4,
    paddingBottom: spacing.vs4,
  },
  header: {
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.vs4,
  },
  placeholder: {
    // no flex here – spacing is handled by justifyContent
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  createBtn: {
    flex: 1,
    marginRight: spacing.s2,
    paddingHorizontal: spacing.s6,
  },
  joinBtn: {
    flex: 1,
    marginLeft: spacing.s2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.s6,
  },
});

export default YourGroupsScreen;
