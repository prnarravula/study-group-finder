import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AuthButton from '../components/AuthButton';
import GroupModal from '../modals/GroupModal';
import { colors, typography, spacing } from '../constants';

const YourGroupsScreen = ({ navigation }) => {
  const [createVisible, setCreateVisible] = useState(false);

  const handleCreateSubmit = (data) => {
    console.log('Creating group with:', data);
    setCreateVisible(false);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        {/* Header */}
        <Text style={styles.header}>Your Groups</Text>

        {/* Placeholder */}
        <View style={styles.placeholder} />

        {/* Buttons */}
        <View style={styles.buttonRow}>
          <AuthButton
            label="Create Group"
            onPress={() => setCreateVisible(true)}
            style={styles.createBtn}
          />
          <AuthButton
            label="Join Group"
            onPress={() => navigation.navigate('FindGroupScreen')}
            style={styles.joinBtn}
            textStyle={{ color: colors.primary }}
          />
        </View>
      </View>

      {/* Create Group Modal */}
      <GroupModal
        visible={createVisible}
        mode="create"
        initialValues={{
          name: '',
          subject: '',
          description: '',
          count: 1,
          countEnabled: true,
          isPublic: false,
        }}
        onSubmit={handleCreateSubmit}
        onClose={() => setCreateVisible(false)}
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
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.vs4,
    justifyContent: 'space-between',
  },
  header: {
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    flex: 1,
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
