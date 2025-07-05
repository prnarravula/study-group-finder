import React, { useState, useEffect, useCallback, useContext } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import {
  GiftedChat,
  Bubble,
  InputToolbar,
  Send,
} from 'react-native-gifted-chat';
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
} from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Provider as PaperProvider } from 'react-native-paper';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { colors, typography, spacing } from '../constants';

export default function IndChatScreen({ route }) {
  const { chatId } = route.params;
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  const [messages, setMessages] = useState([]);
  const [meta, setMeta] = useState({ groupName: 'Group', memberIds: [] });
  const [menuVisible, setMenuVisible] = useState(false);

  /* ───── Chat meta ─────────────────────────────────────────── */
  useEffect(
    () => onSnapshot(doc(db, 'chats', chatId), (s) => s.exists() && setMeta(s.data())),
    [chatId]
  );

  /* ───── Messages listener (oldest → newest) ───────────────── */
  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt'), // ascending
      limit(50)
    );
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => {
          const m = d.data();
          return {
            _id: d.id,
            text: m.text,
            createdAt: m.createdAt?.toDate() ?? new Date(),
            user: { _id: m.senderId, name: m.senderName },
          };
        })
      )
    );
  }, [chatId]);

  /* ───── Send ─────────────────────────────────────────────── */
  const onSend = useCallback(
    async (newMsgs = []) => {
      if (!newMsgs.length) return;
      const m = newMsgs[0];

      await addDoc(collection(db, 'chats', chatId, 'messages'), {
        text: m.text.trim(),
        senderId: user.uid,
        senderName: user.displayName || 'You',
        createdAt: serverTimestamp(),
      });

      await setDoc(
        doc(db, 'chats', chatId),
        {
          lastMsg: m.text.trim(),
          lastSender: user.displayName || '',
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    },
    [chatId, user]
  );

  /* ───── Dropdown actions ─────────────────────────────────── */
  const handleGoBack = () => {
    setMenuVisible(false);
    navigation.goBack();
  };
  const handleSchedule = () => {
    setMenuVisible(false);
    /* hook up later */
  };

  /* ───── Helpers ───────────────────────────────────────────── */
  const getMemberText = (c) => (c === 1 ? '1 member' : `${c} members`);

  const renderBubble = (p) => (
    <Bubble
      {...p}
      wrapperStyle={{
        right: { backgroundColor: colors.primary },
        left: { backgroundColor: colors.surface ?? '#f0f2f5' },
      }}
      textStyle={{
        right: { color: colors.white },
        left: { color: colors.text },
      }}
    />
  );

  const renderInputToolbar = (p) => (
    <InputToolbar
      {...p}
      containerStyle={styles.inputToolbar}
      primaryStyle={{ alignItems: 'center' }}
    />
  );

  const renderSend = (p) => (
    <Send {...p} containerStyle={{ marginRight: spacing.s1, marginBottom: 4 }}>
      <Ionicons name="send" size={24} color={colors.primary} />
    </Send>
  );

  /* ───── UI ───────────────────────────────────────────────── */
  return (
    <PaperProvider>
      <SafeAreaView style={styles.safe}>
        {/* Header */}
        <View style={[styles.headerBar, { paddingTop: insets.top - 30 }]}>
          <View style={styles.headerContent}>
            <View style={styles.headerLeft}>
              <View style={styles.groupIcon}>
                <Ionicons name="people" size={26} color={colors.primary} />
              </View>
              <View style={styles.headerTextContainer}>
                <Text style={styles.headerTitle}>{meta.groupName}</Text>
                <Text style={styles.headerSubtitle}>
                  {getMemberText(meta.memberIds?.length ?? 0)}
                </Text>
              </View>
            </View>

            {/* Dropdown */}
            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.headerRight}
                  onPress={() => setMenuVisible(true)}
                >
                  <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item title="Go Back" onPress={handleGoBack} />
              <Menu.Item title="Schedule Session" onPress={handleSchedule} />
            </Menu>
          </View>
        </View>

        {/* Chat */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -270 : 10}
        >
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: user.uid, name: user.displayName }}
            placeholder="Type a message…"
            renderUsernameOnMessage
            renderBubble={renderBubble}
            renderInputToolbar={renderInputToolbar}
            renderSend={renderSend}
            bottomOffset={insets.bottom}
            keyboardShouldPersistTaps="handled"
            inverted={false}
            messagesContainerStyle={{ paddingTop: spacing.vs2 }} 
          />
        </KeyboardAvoidingView>
      </SafeAreaView>
    </PaperProvider>
  );
}

/* ───── Styles ───────────────────────────────────────────────────── */
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },

  headerBar: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.vs4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gray200,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  groupIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.s3,
  },
  headerTextContainer: { flex: 1 },
  headerTitle: {
    color: colors.text,
    fontWeight: '600',
    fontSize: typography.fontXl,
    marginBottom: 3,
  },
  headerSubtitle: {
    color: colors.text,
    opacity: 0.6,
    fontSize: typography.fontSm,
  },
  headerRight: { padding: spacing.s2 },

  menuContent: {
    backgroundColor: colors.surface ?? '#fff',
    borderRadius: 8,
    paddingVertical: 2,
  },

  inputToolbar: {
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    backgroundColor: colors.background,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.vs1,
  },
});
