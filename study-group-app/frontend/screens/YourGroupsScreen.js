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
  arrayUnion,
  arrayRemove,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { generateUniqueJoinCode } from '../components/GenerateUniqueJoinCode';

export default function YourGroupsScreen({ navigation }) {
  const { user, checking } = useContext(AuthContext);

  // Modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [modalInitial, setModalInitial] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);

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

  // Create flow
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
  const handleCreateSubmit = async data => {
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

  // Edit flow
  const handleEdit = group => {
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
  const handleEditSubmit = async data => {
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

  // Delete, Leave, GetCode
  const handleDelete = group => {
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
  const handleLeave = group => {
    const members = group.memberIds || [];
    if (members.length <= 1) return handleDelete(group);
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
  const handleGetCode = group => {
    Alert.alert('Group code', group.joinCode || 'No code set');
  };

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
            onEdit={handleEdit}             // <-- use handleEdit here
            onViewMembers={g =>
              navigation.navigate('GroupMembers', { groupId: g.id })
            }
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