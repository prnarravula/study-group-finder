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

export default function ChatsScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const [chats, setChats] = useState([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, 'chats'),
      where('memberIds', 'array-contains', user.uid),
      orderBy('updatedAt', 'desc')
    );
    return onSnapshot(q, (snap) =>
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
  }, [user]);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => navigation.navigate('IndChat', { chatId: item.id })}
    >
      <View style={styles.icon}>
        <Ionicons name={item.groupIcon || 'chatbubbles'} size={26} color="white" />
      </View>

      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {item.groupName}
        </Text>
        <Text style={styles.subtitle} numberOfLines={1}>
          {item.lastSender ? `${item.lastSender}: ` : ''}
          {item.lastMsg || ''}
        </Text>
      </View>

      {item.unreadCounts?.[user.uid] > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeTxt}>{item.unreadCounts[user.uid]}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTxt}>Chat</Text>
      </View>

      <FlatList
        data={chats}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
        contentContainerStyle={{ paddingBottom: spacing.vs6 }}
      />
    </SafeAreaView>
  );
}

/* styles */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    backgroundColor: '#002D62',
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs4,
  },
  headerTxt: { color: 'white', fontSize: typography.font4Xl, fontWeight: 'bold' },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs3,
    backgroundColor: 'white',
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#4D8EFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s4,
  },
  textBlock: { flex: 1 },
  title: { fontSize: typography.fontLg, fontWeight: '600', color: colors.text },
  subtitle: { fontSize: typography.fontMd, color: colors.textSecondary, marginTop: 2 },
  badge: {
    minWidth: 20,
    paddingHorizontal: 6,
    borderRadius: 10,
    backgroundColor: '#E30425',
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeTxt: { color: 'white', fontSize: typography.fontSm, fontWeight: '500' },
  sep: { height: 1, backgroundColor: colors.border },
});
