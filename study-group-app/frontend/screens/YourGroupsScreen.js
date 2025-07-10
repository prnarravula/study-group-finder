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
import {
  addDoc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  where,
  onSnapshot,
  updateDoc,
  getDoc,
  arrayRemove,
  arrayUnion,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { colors, typography, spacing } from '../constants';
import { generateUniqueJoinCode } from '../components/GenerateUniqueJoinCode';
import AuthButton from '../components/AuthButton';
import GroupModal from '../modals/GroupModal';
import GroupCard from '../components/GroupCard';

export default function YourGroupsScreen({ navigation }) {
  const { user, checking } = useContext(AuthContext);

  /* modal */
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [modalInitial, setModalInitial] = useState({});
  const [editingGroup, setEditingGroup] = useState(null);

  /* list */
  const [groups, setGroups] = useState([]);

  /* live groups that include me */
  useEffect(() => {
    if (checking || !user) return;
    const q = query(
      collection(db, 'groups'),
      where('memberIds', 'array-contains', user.uid)
    );
    return onSnapshot(q, snap =>
      setGroups(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [checking, user]);

  /* ───────── create group & chat ───────── */
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

      /* group */
      const groupRef = await addDoc(collection(db, 'groups'), {
        ...data,
        ownerId: user.uid,
        adminIds: [user.uid],
        memberIds: [user.uid],
        joinCode,
        createdAt: serverTimestamp(),
      });

      /* chat (same id) */
      await setDoc(doc(db, 'chats', groupRef.id), {
        groupId: groupRef.id,
        groupName: data.name,
        memberIds: [user.uid],
        lastMsg: '',
        lastSender: '',
        updatedAt: serverTimestamp(),
      });

      setModalVisible(false);
    } catch (e) {
      console.error('Create failed:', e);
      Alert.alert('Error', 'Could not create group.');
    }
  };

  /* ───────── edit group ───────── */
  const handleEdit = g => {
    setModalMode('edit');
    setEditingGroup(g);
    setModalInitial({
      name: g.name,
      subject: g.subject,
      description: g.description || '',
      count: g.maxStudentCount,
      countEnabled: g.maxCountEnabled,
      isPublic: g.isPublic,
    });
    setModalVisible(true);
  };

  const handleEditSubmit = async data => {
    try {
      /* groups */
      await updateDoc(doc(db, 'groups', editingGroup.id), {
        name: data.name,
        subject: data.subject,
        description: data.description,
        maxStudentCount: data.count,
        maxCountEnabled: data.countEnabled,
        isPublic: data.isPublic,
      });

      /* chats – rename preview */
      await updateDoc(doc(db, 'chats', editingGroup.id), {
        groupName: data.name,
      });

      setModalVisible(false);
    } catch (e) {
      console.error('Edit failed:', e);
      Alert.alert('Error', 'Could not save changes.');
    }
  };

  /* ───────── delete group & chat ───────── */
  const handleDelete = g => {
    Alert.alert('Delete Group', `Delete "${g.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'chats', g.id));
            await deleteDoc(doc(db, 'groups', g.id));
          } catch (e) {
            console.error('Delete failed:', e);
            Alert.alert('Error', 'Could not delete.');
          }
        },
      },
    ]);
  };

  /* ───────── leave group ───────── */
  const handleLeave = g => {
    if (g.ownerId === user.uid && g.memberIds.length > 1) {
      return Alert.alert(
        'Transfer Ownership First',
        'You are the owner; transfer ownership before leaving.'
      );
    }
    if (g.memberIds.length === 1) return handleDelete(g);

    Alert.alert('Leave Group', `Leave "${g.name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Leave',
        style: 'destructive',
        onPress: async () => {
          /* 1️⃣ groups update */
          try {
            await updateDoc(doc(db, 'groups', g.id), {
              memberIds: arrayRemove(user.uid),
              adminIds: arrayRemove(user.uid),
            });
          } catch (e) {
            console.error('Group leave failed:', e.code, e.message);
            return Alert.alert('Error', 'Could not leave group.');
          }

          /* 2️⃣ chats update – ignore permission failure */
          try {
            const chatRef = doc(db, 'chats', g.id);
            const chatSnap = await getDoc(chatRef);
            if (
              chatSnap.exists() &&
              chatSnap.data()?.memberIds?.includes(user.uid)
            ) {
              await updateDoc(chatRef, {
                memberIds: arrayRemove(user.uid),
              });
            }
          } catch (e) {
            if (e.code !== 'permission-denied') {
              console.error('Chat leave warning:', e.code, e.message);
            }
          }
        },
      },
    ]);
  };

  /* ───────── remove member ───────── */
  const handleRemoveMember = async (g, m) => {
    /* 1️⃣ groups update */
    try {
      await updateDoc(doc(db, 'groups', g.id), {
        memberIds: arrayRemove(m.uid),
        adminIds: arrayRemove(m.uid),
      });
    } catch {
      return Alert.alert('Error', 'Could not remove.');
    }

    /* 2️⃣ chats update – ignore permission failure */
    try {
      const cRef = doc(db, 'chats', g.id);
      const cSnap = await getDoc(cRef);
      if (cSnap.exists() && cSnap.data()?.memberIds?.includes(m.uid)) {
        await updateDoc(cRef, {
          memberIds: arrayRemove(m.uid),
        });
      }
    } catch (e) {
      if (e.code !== 'permission-denied') {
        console.error('Chat remove warning:', e.code, e.message);
      }
    }
  };

  /* ───────── change role ───────── */
  const handleChangeRole = async (g, m, action) => {
    if (action === 'toggleAdmin') {
      const isAd = g.adminIds?.includes(m.uid);
      await updateDoc(doc(db, 'groups', g.id), {
        adminIds: isAd ? arrayRemove(m.uid) : arrayUnion(m.uid),
      });
    } else if (action === 'makeOwner') {
      await updateDoc(doc(db, 'groups', g.id), {
        ownerId: m.uid,
        adminIds: arrayUnion(user.uid),
      });
    }
  };

  /* UI */
  if (checking) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.head}>
        <Text style={styles.headTxt}>Your Groups</Text>
      </View>

      <FlatList
        data={groups}
        keyExtractor={g => g.id}
        renderItem={({ item }) => (
          <GroupCard
            group={item}
            onLeave={handleLeave}
            onGetCode={g => Alert.alert('Code', g.joinCode || '–')}
            onDelete={handleDelete}
            onEdit={handleEdit}
            onRemoveMember={handleRemoveMember}
            onChangeRole={handleChangeRole}
          />
        )}
        contentContainerStyle={styles.listC}
        ListEmptyComponent={() => (
          <View style={styles.empty}>
            <Text style={styles.emptyTxt}>No groups yet.</Text>
          </View>
        )}
      />

      <View style={styles.btnRow}>
        <AuthButton label="Create Group" style={styles.btn} onPress={handleCreate} />
        <AuthButton
          label="Join Group"
          style={[styles.btn, styles.joinBtn]}
          textStyle={{ color: colors.primary }}
          onPress={() => navigation.navigate('FindGroupScreen')}
        />
      </View>

      <GroupModal
        visible={modalVisible}
        mode={modalMode}
        initialValues={modalInitial}
        onSubmit={modalMode === 'create' ? handleCreateSubmit : handleEditSubmit}
        onClose={() => setModalVisible(false)}
      />
    </SafeAreaView>
  );
}

/* styles */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  head: {
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs4,
  },
  headTxt: {
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  listC: { paddingHorizontal: spacing.s4, paddingBottom: spacing.vs4 },
  empty: { marginTop: spacing.vs6, alignItems: 'center' },
  emptyTxt: { fontSize: typography.fontMd, color: colors.textSecondary },
  btnRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: 'white',
    paddingTop: spacing.vs3,
    paddingHorizontal: spacing.s4,
  },
  btn: {
    flex: 1,
    marginHorizontal: spacing.s2,
   	paddingHorizontal: spacing.s6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtn: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
});
