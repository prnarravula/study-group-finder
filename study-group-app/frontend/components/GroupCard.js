import React, { useContext, useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  FlatList,
  Platform,
  ActionSheetIOS,
  Alert,
  TouchableWithoutFeedback,
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
  onChangeRole,
}) {
  const { user } = useContext(AuthContext);
  const isOwner = user.uid === group.ownerId;
  const isAdmin = (group.adminIds || []).includes(user.uid);

  const roleOf = (uid) =>
    uid === group.ownerId
      ? 'owner'
      : (group.adminIds || []).includes(uid)
      ? 'admin'
      : 'member';

  const [showMembers, setShowMembers] = useState(false);
  const [members, setMembers] = useState([]);

  // Android custom sheet state
  const [showAndroidTop, setShowAndroidTop] = useState(false);
  const [showAndroidMember, setShowAndroidMember] = useState(false);
  const [memberToAct, setMemberToAct] = useState(null);

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

  /* Top menu options */
  const topOpts = [
    'Leave Group',
    'Get Code',
    ...(isOwner ? ['Delete Group'] : []),
    ...(isOwner || isAdmin ? ['Edit Group', 'View Members'] : []),
    'Cancel',
  ];
  const cancelTop = topOpts.length - 1;
  const destructiveTop = topOpts.indexOf('Delete Group');

  const doTop = (index) => {
    if (index === cancelTop) return;
    const action = topOpts[index];
    switch (action) {
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
    }
  };

  const openTopMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        { options: topOpts, cancelButtonIndex: cancelTop, destructiveButtonIndex: destructiveTop >= 0 ? destructiveTop : undefined, title: group.name },
        doTop
      );
    } else {
      setShowAndroidTop(true);
    }
  };

  /* Member menu helpers */
  const getMemberOpts = (member) => {
    const targetRole = roleOf(member.uid);
    const canRemove = isOwner || (isAdmin && targetRole === 'member');
    const canChange = isOwner && member.uid !== group.ownerId;
    const adminLabel = targetRole === 'admin' ? 'Remove Admin' : 'Make Admin';
    return [
      ...(canChange ? [adminLabel, 'Make Owner'] : []),
      ...(canRemove ? ['Remove from Group'] : []),
      'Cancel',
    ];
  };

  const handleMemberSelect = (sel, member) => {
    if (sel === 'Make Admin' || sel === 'Remove Admin') {
      onChangeRole(group, member, 'toggleAdmin');
    } else if (sel === 'Make Owner') {
      Alert.alert(
        'Transfer Ownership',
        `Promote ${member.displayName} to owner?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Transfer', style: 'destructive', onPress: () => onChangeRole(group, member, 'makeOwner') },
        ]
      );
    } else if (sel === 'Remove from Group') {
      onRemoveMember(group, member);
    }
  };

  const memberMenu = (member) => {
    if (Platform.OS === 'ios') {
      const opts = getMemberOpts(member);
      ActionSheetIOS.showActionSheetWithOptions(
        { options: opts, cancelButtonIndex: opts.length - 1, destructiveButtonIndex: opts.indexOf('Remove from Group'), title: member.displayName },
        (idx) => { if (idx !== opts.length - 1) handleMemberSelect(opts[idx], member); }
      );
    } else {
      setMemberToAct(member);
      setShowAndroidMember(true);
    }
  };

  return (
    <>
      <View style={styles.card}>
        <View style={styles.cardText}>
          <Text style={styles.title}>{group.name}</Text>
          <Text style={styles.sub}>{group.subject} • {group.isPublic ? 'Public' : 'Private'}</Text>
        </View>
        <TouchableOpacity onPress={openTopMenu} style={styles.moreBtn}>
          <Ionicons name="ellipsis-vertical" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* iOS members modal */}
      <Modal visible={showMembers} animationType="fade" transparent onRequestClose={() => setShowMembers(false)}>
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
                    <Text style={styles.role}>{roleOf(item.uid)}</Text>
                  </View>
                  {(isOwner || isAdmin) && item.uid !== user.uid && (
                    <TouchableOpacity style={styles.rowBtn} onPress={() => memberMenu(item)}>
                      <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  )}
                </View>
              )}
            />
            <TouchableOpacity style={styles.closeBtn} onPress={() => setShowMembers(false)}>
              <Text style={styles.closeTxt}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Android top menu */}
      {Platform.OS === 'android' && showAndroidTop && (
        <Modal visible transparent animationType="slide" onRequestClose={() => setShowAndroidTop(false)}>
          <TouchableWithoutFeedback onPress={() => setShowAndroidTop(false)}>
            <View style={styles.overlay} />
          </TouchableWithoutFeedback>
          <View style={styles.androidSheet}>
            {topOpts.map((opt, i) => (
              <TouchableOpacity key={opt} style={styles.androidOption} onPress={() => { setShowAndroidTop(false); doTop(i); }}>
                <Text style={[styles.androidText, i === cancelTop && { fontWeight: '600' }, i === destructiveTop && { color: 'red' }]}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Modal>
      )}

      {/* Android member menu */}
      {Platform.OS === 'android' && showAndroidMember && memberToAct && (() => {
        const opts = getMemberOpts(memberToAct);
        const cancelIdx = opts.length - 1;
        const destructiveIdx = opts.indexOf('Remove from Group');
        return (
          <Modal visible transparent animationType="slide" onRequestClose={() => setShowAndroidMember(false)}>
            <TouchableWithoutFeedback onPress={() => setShowAndroidMember(false)}>
              <View style={styles.overlay} />
            </TouchableWithoutFeedback>
            <View style={styles.androidSheet}>
              {opts.map((opt, idx) => (
                <TouchableOpacity key={opt} style={styles.androidOption} onPress={() => { setShowAndroidMember(false); handleMemberSelect(opt, memberToAct); }}>
                  <Text style={[styles.androidText, idx === cancelIdx && { fontWeight: '600' }, idx === destructiveIdx && { color: 'red' }]}>{opt}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </Modal>
        );
      })()}
    </>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: 'white', borderRadius: spacing.s2, padding: spacing.s4, marginVertical: spacing.vs2, borderWidth: 1, borderColor: colors.border, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 5, shadowOffset: { width: 0, height: 2 }, elevation: 3, },
  cardText: { flex: 1, paddingRight: spacing.s2 },
  title: { fontSize: typography.fontLg, fontWeight: '600', color: colors.text },
  sub: { fontSize: typography.fontMd, color: colors.textSecondary, marginTop: spacing.vs2 },
  moreBtn: { paddingLeft: spacing.s2, paddingVertical: spacing.vs1 },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', alignItems: 'center' },
  modal: { width: '90%', maxHeight: '75%', backgroundColor: 'white', borderRadius: spacing.s4, padding: spacing.s4, },
  modalTitle: { fontSize: typography.fontLg, fontWeight: '600', alignSelf: 'center', marginBottom: spacing.vs2 },
  sep: { height: 1, backgroundColor: colors.border },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.vs2 },
  name: { fontSize: typography.fontMd, color: colors.text },
  role: { fontSize: typography.fontSm, color: colors.textSecondary },
  rowBtn: { padding: spacing.s1 },
  closeBtn: { marginTop: spacing.vs4, alignSelf: 'center', paddingHorizontal: spacing.s4, paddingVertical: spacing.vs2, borderRadius: spacing.s2, backgroundColor: colors.primary },
  closeTxt: { color: 'white', fontSize: typography.fontMd, fontWeight: '500' },

  // Android sheet styles
  androidSheet: { backgroundColor: 'white', paddingVertical: spacing.vs3, borderTopLeftRadius: spacing.s4, borderTopRightRadius: spacing.s4 },
  androidOption: { paddingVertical: spacing.vs2, alignItems: 'center' },
  androidText: { fontSize: typography.fontMd, color: colors.text },
});
