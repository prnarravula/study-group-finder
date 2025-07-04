import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
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
  arrayRemove,
  arrayUnion,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { generateUniqueJoinCode } from '../components/GenerateUniqueJoinCode';

export default function YourGroupsScreen({ navigation }) {
  const { user, checking } = useContext(AuthContext);

  /* ───────── modal state ───────── */
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' | 'edit'
  const [modalInitial, setModalInitial] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);

  /* ───────── group list ───────── */
  const [groups, setGroups] = useState([]);

  useEffect(() => {
    if (checking || !user) return;
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', user.uid)
    );
    return onSnapshot(
      q,
      (snap) => setGroups(snap.docs.map((d) => ({ id: d.id, ...d.data() }))),
      (err) => console.error('Error fetching groups:', err)
    );
  }, [checking, user]);

  /* ───────── create ───────── */
  const handleCreate = () => {
    setModalMode('create');
    setModalInitial({
      name: '',
      subject: '',
      description: '',
      count: 1,
      countEnabled: true,
      isPublic: false,
    });
    setModalVisible(true);
  };

  const handleCreateSubmit = async (data) => {
    try {
      const joinCode = await generateUniqueJoinCode();
      await addDoc(collection(db, 'groups'), {
        ...data,
        ownerId: user.uid,
        adminIds: [user.uid],
        memberIds: [user.uid],
        joinCode,
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
    } catch (e) {
      console.error('Create failed:', e);
      Alert.alert('Error', 'Could not create group.');
    }
  };

  /* ───────── edit ───────── */
  const handleEdit = (group) => {
    setModalMode('edit');
    setEditingGroup(group);
    setModalInitial({
      name: group.name,
      subject: group.subject,
      description: group.description || '',
      count: group.maxStudentCount,
      countEnabled: group.maxCountEnabled,
      isPublic: group.isPublic,
    });
    setModalVisible(true);
  };

  const handleEditSubmit = async (data) => {
    try {
      await updateDoc(doc(db, 'groups', editingGroup.id), {
        name: data.name,
        subject: data.subject,
        description: data.description,
        maxStudentCount: data.count,
        maxCountEnabled: data.countEnabled,
        isPublic: data.isPublic,
      });
      setModalVisible(false);
    } catch (e) {
      console.error('Edit failed:', e);
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  /* ───────── delete / leave ───────── */
  const handleDelete = (group) => {
    Alert.alert(
      'Delete Group',
      `Delete "${group.name}"? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'groups', group.id));
            } catch (e) {
              console.error('Delete failed:', e);
              Alert.alert('Error', 'Could not delete group.');
            }
          },
        },
      ]
    );
  };

  const handleLeave = (group) => {
    const members = group.memberIds || [];

    // owner cannot leave unless alone
    if (group.ownerId === user.uid) {
      if (members.length <= 1) return handleDelete(group);
      return Alert.alert(
        'Transfer Ownership First',
        `You’re the owner of "${group.name}". Please transfer ownership before leaving.`
      );
    }

    Alert.alert(
      'Leave Group',
      `Leave "${group.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            try {
              await updateDoc(doc(db, 'groups', group.id), {
                memberIds: arrayRemove(user.uid),
                adminIds: arrayRemove(user.uid),
              });
            } catch (e) {
              console.error('Leave failed:', e);
              Alert.alert('Error', 'Could not leave group.');
            }
          },
        },
      ]
    );
  };

  /* ───────── member removal ───────── */
  const handleRemoveMember = async (group, member) => {
    try {
      await updateDoc(doc(db, 'groups', group.id), {
        memberIds: arrayRemove(member.uid),
        adminIds: arrayRemove(member.uid),
      });
    } catch (e) {
      console.error('Remove member failed:', e);
      Alert.alert('Error', 'Could not remove member.');
    }
  };

  /* ───────── role changes ───────── */
  const handleChangeRole = async (group, member, action) => {
    if (action === 'toggleAdmin') {
      const isAdminNow = (group.adminIds || []).includes(member.uid);
      try {
        await updateDoc(doc(db, 'groups', group.id), {
          adminIds: isAdminNow
            ? arrayRemove(member.uid)   // demote
            : arrayUnion(member.uid),   // promote
        });
      } catch (e) {
        console.error('Toggle admin failed:', e);
        Alert.alert('Error', 'Could not change role.');
      }
    } else if (action === 'makeOwner') {
      try {
        await updateDoc(doc(db, 'groups', group.id), {
          ownerId: member.uid,
          adminIds: arrayUnion(user.uid),   // previous owner stays as admin
        });
      } catch (e) {
        console.error('Transfer owner failed:', e);
        Alert.alert('Error', 'Could not transfer ownership.');
      }
    }
  };

  /* ───────── misc ───────── */
  const handleGetCode = (group) =>
    Alert.alert('Group code', group.joinCode || 'No code set');

  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* header */}
      <View style={styles.headerPane}>
        <Text style={styles.header}>Your Groups</Text>
      </View>

      {/* list */}
      <FlatList
        data={groups}
        keyExtractor={(g) => g.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onLeave={handleLeave}
            onGetCode={handleGetCode}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRemoveMember={handleRemoveMember}
            onChangeRole={handleChangeRole}   // passes (group, member, action)
          />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              You haven’t created any groups yet.
            </Text>
          </View>
        }
      />

      {/* bottom buttons */}
      <View style={styles.buttonRow}>
        <AuthButton
          label="Create Group"
          onPress={handleCreate}
          style={styles.createBtn}
        />
        <AuthButton
          label="Join Group"
          onPress={() => navigation.navigate('FindGroupScreen')}
          style={styles.joinBtn}
          textStyle={{ color: colors.primary }}
        />
      </View>

      {/* create / edit modal */}
      <GroupModal
        visible={modalVisible}
        mode={modalMode}
        initialValues={modalInitial}
        onSubmit={
          modalMode === 'create' ? handleCreateSubmit : handleEditSubmit
        }
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

/* ───────── styles ───────── */
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
