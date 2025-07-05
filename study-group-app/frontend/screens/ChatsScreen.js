import React, { useContext, useEffect, useState } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';

/**
 * ChatsScreen
 * -------------
 * Matches the light header used across the app:
 * - Transparent-looking bar that sits on the background
 * - Subtle bottom divider
 * - Card-style rows with elevation + soft shadow
 * - Pill-style unread badge
 */
export default function ChatsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);

  /* -------- Firestore listener -------- */
  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('memberIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, snap =>
      setChats(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  /* -------- Render a single chat row -------- */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={() =>
        navigation.navigate('IndChat', {
          chatId: item.id,
          title: item.groupName,
        })
      }
    >
      <View style={styles.iconCircle}>
        <Ionicons
          name={item.groupIcon || 'chatbubbles'}
          size={24}
          color="white"
        />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {item.groupName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.lastSender ? `${item.lastSender}: ` : ''}
          {item.lastMsg || 'No messages yet'}
        </Text>
      </View>

      {item.unreadCounts?.[user.uid] > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {item.unreadCounts[user.uid]}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header bar */}
      <View style={styles.headerBar}>
        <Text style={styles.headerText}>Chats</Text>
      </View>

      {/* Chat list */}
      <FlatList
        data={chats}
        keyExtractor={c => c.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={{ marginTop: spacing.vs6, alignItems: 'center' }}>
            <Text style={styles.emptyText}>No conversations yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const CARD_RADIUS = spacing.s3;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  /* Header */
  headerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
  },
  headerText: {
    color: colors.text,
    fontSize: typography.font4Xl,
    fontWeight: 'bold',
  },

  /* List */
  listContent: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs3,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface ?? 'white',
    borderRadius: CARD_RADIUS,
    padding: spacing.s3,
    marginBottom: spacing.vs3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  iconCircle: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s3,
  },
  textBlock: { flex: 1 },
  title: {
    fontSize: typography.fontLg,
    fontWeight: '600',
    color: colors.text,
  },
  subtitle: {
    fontSize: typography.fontMd,
    color: colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.accent ?? '#E30425',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: spacing.s2,
  },
  badgeText: {
    color: 'white',
    fontSize: typography.fontSm,
    fontWeight: '500',
  },
  emptyText: {
    color: colors.textSecondary,
    fontSize: typography.fontMd,
  },
});
