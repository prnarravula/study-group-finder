import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants';
import { AuthContext } from '../../backend/AuthContext';
import { db } from '../../backend/firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
} from 'firebase/firestore';

export default function GroupCard({
  group,
  onLeave,
  onGetCode,
  onDelete,
  onEdit,
  onRemoveMember,
  onChangeRole, // (group, member, action)
}) {
  const { user } = useContext(AuthContext);

  /* ───────── helpers ───────── */
  const isOwner = user.uid === group.ownerId;
  const isAdmin = (group.adminIds || []).includes(user.uid);

  const roleOf = (uid) =>
    uid === group.ownerId
      ? 'owner'
      : (group.adminIds || []).includes(uid)
      ? 'admin'
      : 'member';

  /* ───────── state ───────── */
  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]); // {uid, displayName}

  /* ───────── fetch member profiles (on-demand) ───────── */
  useEffect(() => {
    if (!showMembers) return;
    (async () => {
      const ids = group.memberIds || [];
      if (!ids.length) return setMembers([]);

      const out = [];
      for (let i = 0; i < ids.length; i += 10) {
        const chunk = ids.slice(i, i + 10);
        const snap = await getDocs(
          query(collection(db, 'students'), where('__name__', 'in', chunk))
        );
        snap.forEach((d) => out.push({ uid: d.id, ...d.data() }));
      }
      setMembers(
        ids.map((uid) => {
          const found = out.find((p) => p.uid === uid) || {};
          return { uid, displayName: found.displayName ?? 'Unnamed' };
        })
      );
    })();
  }, [showMembers, group.memberIds]);

  /* ───────── top (card) menu ───────── */
  const topOpts = [
    'Leave Group',
    'Get Code',
    ...(isOwner ? ['Delete Group'] : []),
    ...(isOwner || isAdmin ? ['Edit Group', 'View Members'] : []),
    'Cancel',
  ];
  const cancelTop = topOpts.length - 1;

  const doTop = (i) => {
    if (i === cancelTop) return;
    switch (topOpts[i]) {
      case 'Leave Group':
        return onLeave(group);
      case 'Get Code':
        return onGetCode(group);
      case 'Delete Group':
        return onDelete(group);
      case 'Edit Group':
        return onEdit(group);
      case 'View Members':
        return setShowMembers(true);
      default:
        return;
    }
  };

  const openTopMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: topOpts, cancelButtonIndex: cancelTop, title: group.name },
        doTop
      );
    } else {
      Alert.alert(
        group.name,
        null,
        topOpts.map((o, idx) => ({
          text: o,
          style: idx === cancelTop ? 'cancel' : 'default',
          onPress: () => doTop(idx),
        }))
      );
    }
  };

  /* ───────── per-member 3-dot menu ───────── */
  const memberMenu = (member) => {
    const targetRole = roleOf(member.uid);
    const targetIsAdmin = targetRole === 'admin';

    /* Remove is visible only if:
         • viewer is owner, or
         • viewer is admin AND target is just a member        */
    const canRemove =
      isOwner || (isAdmin && !isOwner && targetRole === 'member');

    const canChangeRole = isOwner && member.uid !== group.ownerId;
    const adminLabel = targetIsAdmin ? 'Remove Admin' : 'Make Admin';

    const menu = [
      ...(canChangeRole ? [adminLabel, 'Make Owner'] : []),
      ...(canRemove ? ['Remove from Group'] : []),
      'Cancel',
    ];
    const cancelM = menu.length - 1;

    const act = (idx) => {
      if (idx === cancelM) return;
      const sel = menu[idx];

      if (sel === adminLabel) {
        onChangeRole && onChangeRole(group, member, 'toggleAdmin');
      } else if (sel === 'Make Owner') {
        Alert.alert(
          'Transfer Ownership',
          `Promote ${member.displayName} to owner?\n(You will remain an admin)`,
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Transfer',
              style: 'destructive',
              onPress: () =>
                onChangeRole && onChangeRole(group, member, 'makeOwner'),
            },
          ]
        );
      } else if (sel === 'Remove from Group') {
        if (member.uid !== user.uid) {
          onRemoveMember && onRemoveMember(group, member);
        }
      }
    };

    /* platform sheet */
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: menu,
          cancelButtonIndex: cancelM,
          destructiveButtonIndex: menu.indexOf('Remove from Group'),
          title: member.displayName,
        },
        act
      );
    } else {
      Alert.alert(
        member.displayName,
        null,
        menu.map((o, idx) => ({
          text: o,
          style:
            o === 'Remove from Group'
              ? 'destructive'
              : idx === cancelM
              ? 'cancel'
              : 'default',
          onPress: () => act(idx),
        }))
      );
    }
  };

  /* ───────── render ───────── */
  return (
    <>
      {/* group card */}
      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.sub}>
            {group.subject} • {group.isPublic ? 'Public' : 'Private'}
          </Text>
        </View>
        <TouchableOpacity onPress={openTopMenu} style={styles.moreBtn}>
          <Ionicons
            name="ellipsis-vertical"
            size={24}
            color={colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* members modal */}
      <Modal
        visible={showMembers}
        animationType="fade"
        transparent
        onRequestClose={() => setShowMembers(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Members</Text>

            <FlatList
              data={members}
              keyExtractor={(m) => m.uid}
              ItemSeparatorComponent={() => <View style={styles.sep} />}
              renderItem={({ item }) => (
                <View style={styles.row}>
                  <View>
                    <Text style={styles.name}>{item.displayName}</Text>
                    <Text style={styles.role}>
                      {roleOf(item.uid).replace(/^\w/, (c) => c.toUpperCase())}
                    </Text>
                  </View>

                  {(isOwner || isAdmin) && item.uid !== user.uid && (
                    <TouchableOpacity
                      style={styles.rowBtn}
                      onPress={() => memberMenu(item)}
                    >
                      <Ionicons
                        name="ellipsis-vertical"
                        size={20}
                        color={colors.textSecondary}
                      />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />

            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setShowMembers(false)}
            >
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

/* ───────── styles ───────── */
const styles = StyleSheet.create({
  /* card */
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'white',
    borderRadius: spacing.s2,
    padding: spacing.s4,
    marginVertical: spacing.vs2,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  cardText: { flex: 1, paddingRight: spacing.s2 },
  title: { fontSize: typography.fontLg, fontWeight: '600', color: colors.text },
  sub: { fontSize: typography.fontMd, color: colors.textSecondary, marginTop: spacing.vs2 },
  moreBtn: { paddingLeft: spacing.s2, paddingVertical: spacing.vs1 },

  /* modal */
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '90%',
    maxHeight: '75%',
    backgroundColor: 'white',
    borderRadius: spacing.s4,
    padding: spacing.s4,
  },
  modalTitle: {
    fontSize: typography.fontLg,
    fontWeight: '600',
    alignSelf: 'center',
    marginBottom: spacing.vs2,
  },
  sep: { height: 1, backgroundColor: colors.border },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.vs2,
  },
  name: { fontSize: typography.fontMd, color: colors.text },
  role: { fontSize: typography.fontSm, color: colors.textSecondary },
  rowBtn: { padding: spacing.s1 },

  closeBtn: {
    marginTop: spacing.vs4,
    alignSelf: 'center',
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs2,
    borderRadius: spacing.s2,
    backgroundColor: colors.primary,
  },
  closeTxt: { color: 'white', fontSize: typography.fontMd, fontWeight: '500' },
});
