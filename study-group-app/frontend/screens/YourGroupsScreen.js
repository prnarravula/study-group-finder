import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import GroupModal from '../modals/GroupModal';
import GroupCard from '../components/GroupCard';
import { colors, typography, spacing } from '../constants';
import {
  addDoc,
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';

export default function YourGroupsScreen({ navigation }) {
  const { user, checking } = useContext(AuthContext);
  const [createVisible, setCreateVisible] = useState(false);
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (checking || !user) return;
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', user.uid)
    );
    return onSnapshot(
      q,
      snap => setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() }))),
      err => console.error('Error fetching groups:', err)
    );
  }, [checking, user]);

  const handleCreateSubmit = async data => {
    if (!user) {
      Alert.alert('Error', 'You must be signed in to create a group.');
      return;
    }
    const {
      name,
      subject,
      description,
      count: maxStudentCount,
      countEnabled: maxCountEnabled,
      isPublic,
    } = data;

    try {
      await addDoc(collection(db, 'groups'), {
        name,
        subject,
        description,
        maxStudentCount,
        maxCountEnabled,
        isPublic,
        ownerId: user.uid,           // ← new ownerId
        adminIds: [user.uid],        // ← new array of admins
        memberIds: [user.uid],       // ← membership
        createdAt: serverTimestamp(),
      });
      setCreateVisible(false);
    } catch (e) {
      console.error('Create group failed:', e);
      Alert.alert('Error', 'Could not create group. Please try again.');
    }
  };

  const handleJoinGroup = async groupId => {
    try {
      await updateDoc(doc(db, 'groups', groupId), {
        memberIds: arrayUnion(user.uid),
      });
      Alert.alert('Joined!', 'You are now a member.');
    } catch (e) {
      console.error('Join failed:', e);
      Alert.alert('Error', 'Could not join group.');
    }
  };

  const handleDelete = async group => {
    try {
      await doc(db, 'groups', group.id).delete();
      Alert.alert('Deleted', group.name);
    } catch (e) {
      console.error('Delete failed:', e);
      Alert.alert('Error', 'Could not delete group.');
    }
  };

  const handleLeave = async group => {
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        memberIds: arrayUnion() // implement removal via arrayRemove if desired
      });
      Alert.alert('Left group', group.name);
    } catch (e) {
      console.error('Leave failed:', e);
      Alert.alert('Error', 'Could not leave group.');
    }
  };

  const handleGetCode = group => {
    Alert.alert('Group code', group.joinCode || 'No code set');
  };

  const onEdit = group => navigation.navigate('EditGroup', { groupId: group.id });
  const onViewMembers = group =>
    navigation.navigate('GroupMembers', { groupId: group.id });

  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.headerPane}>
        <Text style={styles.header}>Your Groups</Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onLeave={handleLeave}
            onGetCode={handleGetCode}
            onDelete={handleDelete}
            onEdit={onEdit}
            onViewMembers={onViewMembers}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You haven’t created any groups yet.
            </Text>
          </View>
        }
      />

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
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  headerPane: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs4,
  },
  header: {
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.vs4,
  },
  emptyContainer: {
    marginTop: spacing.vs6,
    alignItems: 'center',
    paddingHorizontal: spacing.s4,
  },
  emptyText: {
    fontSize: typography.fontMd,
    color: colors.textSecondary,
  },
  buttonRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'white',
    paddingTop: spacing.vs3,
    paddingHorizontal: spacing.s4,
    marginBottom: spacing.vs4,
  },
  createBtn: { flex: 1, marginRight: spacing.s2, paddingHorizontal: spacing.s6 },
  joinBtn: {
    flex: 1,
    marginLeft: spacing.s2,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: spacing.s6,
  },
});
