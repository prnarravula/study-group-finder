import React, { useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ActionSheetIOS,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants';
import { AuthContext } from '../../backend/AuthContext';

export default function GroupCard({
  group,
  onLeave,
  onGetCode,
  onDelete,
  onEdit,
  onViewMembers,
}) {
  const { user } = useContext(AuthContext);

  // Determine the highest role
  const isOwner = user.uid === group.ownerId;
  const isAdmin =
    Array.isArray(group.adminIds) && group.adminIds.includes(user.uid);
  // Base actions
  const base = ['Leave Group', 'Get Code'];
  // Admin/owner actions
  const adminActions =
    isOwner || isAdmin
      ? ['Delete Group', 'Edit Group', 'View Members']
      : [];
  const options = [...base, ...adminActions, 'Cancel'];
  const cancelIndex = options.length - 1;

  const handle = (idx) => {
    if (idx === cancelIndex) return;
    const choice = options[idx];
    switch (choice) {
      case 'Leave Group':
        return onLeave(group);
      case 'Get Code':
        return onGetCode(group);
      case 'Delete Group':
        return onDelete(group);
      case 'Edit Group':
        return onEdit(group);
      case 'View Members':
        return onViewMembers(group);
    }
  };

  const showMenu = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex: cancelIndex,
          title: group.name,
        },
        handle
      );
    } else {
      Alert.alert(
        group.name,
        null,
        options.map((opt, i) => ({
          text: opt,
          style: i === cancelIndex ? 'cancel' : 'default',
          onPress: () => handle(i),
        }))
      );
    }
  };

  return (
    <View style={styles.groupCard}>
      <View style={styles.cardText}>
        <Text style={styles.groupName}>{group.name}</Text>
        <Text style={styles.groupSubtitle}>
          {group.subject} • {group.isPublic ? 'Public' : 'Private'}
        </Text>
      </View>
      <TouchableOpacity onPress={showMenu} style={styles.moreButton}>
        <Ionicons
          name="ellipsis-vertical"
          size={24}
          color={colors.textSecondary}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  groupCard: {
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
  cardText: {
    flex: 1,
    paddingRight: spacing.s2,
  },
  groupName: {
    fontSize: typography.fontLg,
    fontWeight: '600',
    color: colors.text,
  },
  groupSubtitle: {
    fontSize: typography.fontMd,
    color: colors.textSecondary,
    marginTop: spacing.vs2,
  },
  moreButton: {
    paddingLeft: spacing.s2,
    paddingVertical: spacing.vs1,
  },
});
