import React, { useContext, useEffect, useState, useCallback } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  deleteDoc,
  serverTimestamp,
  doc,
  setDoc,
  Timestamp,
} from 'firebase/firestore';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Menu, Provider as PaperProvider } from 'react-native-paper';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import { colors, typography, spacing } from '../constants';

export default function IndChatScreen({ route }) {
  const { chatId, title } = route.params;   // title = group name fallback
  const { user } = useContext(AuthContext);
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();

  /* ── state ── */
  const [messages, setMessages] = useState([]);
  const [groupMeta, setGroupMeta] = useState({
    groupName: title ?? 'Group',
    memberIds: [],
    adminIds: [],
    ownerId: '',
  });
  const [menuVisible, setMenuVisible] = useState(false);

  /* modal */
  const [modalVisible, setModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [endTime, setEndTime] = useState(new Date(Date.now() + 3600000));
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startOpen, setStartOpen] = useState(false);
  const [endOpen, setEndOpen] = useState(false);

  /* session */
  const [sessionDoc, setSessionDoc] = useState(null);

  /* ── listeners ── */
  useEffect(
    () =>
      onSnapshot(doc(db, 'groups', chatId), (s) => {
        if (!s.exists()) return;
        const d = s.data();
        setGroupMeta({
          ...d,
          groupName: d.groupName ?? d.name ?? title ?? 'Group',
        });
      }),
    [chatId, title]
  );

  useEffect(() => {
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt'),
      limit(50)
    );
    return onSnapshot(q, (snap) =>
      setMessages(
        snap.docs.map((d) => ({
          _id: d.id,
          text: d.data().text,
          createdAt: d.data().createdAt?.toDate() ?? new Date(),
          user: { _id: d.data().senderId, name: d.data().senderName },
        }))
      )
    );
  }, [chatId]);

  useEffect(() => {
    const unsub = onSnapshot(
      collection(db, 'groups', chatId, 'sessions'),
      (snap) => {
        if (snap.empty) return setSessionDoc(null);
        const d = snap.docs[0];
        setSessionDoc({ id: d.id, data: d.data() });
      }
    );
    return unsub;
  }, [chatId]);

  /* ── helpers ── */
  const isAdminOrOwner =
    user.uid === groupMeta.ownerId ||
    (groupMeta.adminIds || []).includes(user.uid);

  const canDeleteSession =
    sessionDoc && (sessionDoc.data.createdBy === user.uid || isAdminOrOwner);

  const memberTxt = (c) => (c === 1 ? '1 member' : `${c} members`);

  /* ── send ── */
  const onSend = useCallback(
    async (msgs) => {
      if (!msgs?.length) return;
      const m = msgs[0];
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

  /* ── session actions ── */
  const confirmDeleteSession = () =>
    Alert.alert('Delete this session?', 'This action cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () =>
          deleteDoc(doc(db, 'groups', chatId, 'sessions', sessionDoc.id)),
      },
    ]);

  const openSchedule = () => {
    setMenuVisible(false);
    if (sessionDoc) {
      Alert.alert(
        'Session already scheduled',
        'Only one session can exist per group.',
        canDeleteSession
          ? [
              {
                text: 'Delete',
                style: 'destructive',
                onPress: confirmDeleteSession,
              },
              { text: 'OK', style: 'cancel' },
            ]
          : [{ text: 'OK', style: 'cancel' }]
      );
      return;
    }
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!location.trim() || !description.trim()) {
      alert('Please fill out every field');
      return;
    }
    if (endTime <= startTime) {
      alert('End time must be after start time');
      return;
    }
    try {
      await addDoc(collection(db, 'groups', chatId, 'sessions'), {
        startTime: Timestamp.fromDate(startTime),
        endTime: Timestamp.fromDate(endTime),
        location: location.trim(),
        description: description.trim(),
        createdBy: user.uid,
        createdAt: serverTimestamp(),
      });
      setModalVisible(false);
      setLocation('');
      setDescription('');
    } catch (e) {
      console.error(e);
      alert('Could not save session.');
    }
  };

  /* ── render helpers ── */
  const renderBubble = (p) => (
    <Bubble
      {...p}
      wrapperStyle={{
        right: { backgroundColor: colors.primary },
        left: { backgroundColor: colors.surface ?? '#f0f2f5' },
      }}
      textStyle={{ right: { color: colors.white }, left: { color: colors.text } }}
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

  /* ── UI ── */
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
                <Text style={styles.headerTitle}>{groupMeta.groupName}</Text>
                <Text style={styles.headerSubtitle}>
                  {memberTxt(groupMeta.memberIds?.length ?? 0)}
                </Text>
              </View>
            </View>

            <Menu
              visible={menuVisible}
              onDismiss={() => setMenuVisible(false)}
              anchor={
                <TouchableOpacity
                  style={styles.headerRight}
                  onPress={() => setMenuVisible(true)}
                >
                  <Ionicons
                    name="ellipsis-vertical"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
              }
              contentStyle={styles.menuContent}
            >
              <Menu.Item
                title="Go Back"
                onPress={() => {
                  setMenuVisible(false);
                  navigation.goBack();
                }}
              />
              <Menu.Item title="Schedule Session" onPress={openSchedule} />
              {canDeleteSession && (
                <Menu.Item
                  title="Delete Session"
                  onPress={() => {
                    setMenuVisible(false);
                    confirmDeleteSession();
                  }}
                  titleStyle={{ color: colors.error ?? '#E30425' }}
                />
              )}
            </Menu>
          </View>
        </View>

        {/* Chat */}
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? -270 : -230}
        >
          <GiftedChat
            messages={messages}
            onSend={onSend}
            user={{ _id: user.uid, name: user.displayName }}
            placeholder="Type a message…"
            renderUsernameOnMessage
            renderBubble={renderBubble}
            renderInputToolbar={modalVisible ? () => null : renderInputToolbar}
            renderSend={renderSend}
            bottomOffset={insets.bottom}
            keyboardShouldPersistTaps="handled"
            inverted={false}
            isTypingDisabled={modalVisible}
            messagesContainerStyle={{ paddingTop: spacing.vs2 }}
          />
        </KeyboardAvoidingView>

        {/* Scheduler Modal (unchanged) */}
        {/* … all the modal code stays exactly the same … */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.overlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.cardWrapper}
            >
              <ScrollView
                contentContainerStyle={styles.card}
                keyboardShouldPersistTaps="handled"
              >
                <Text style={styles.modalTitle}>Schedule Session</Text>
                {/* pickers + inputs + buttons exactly as before */}
                {/* Start picker */}
                <Text style={styles.label}>Start</Text>
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => setStartOpen(!startOpen)}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.pickerText}>
                    {startTime.toLocaleString()}
                  </Text>
                </TouchableOpacity>
                {startOpen && (
                  <DateTimePicker
                    value={startTime}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'inline'}
                    textColor={colors.text}
                    onChange={(_, d) => {
                      if (d) {
                        setStartTime(d);
                        if (d >= endTime) {
                          setEndTime(
                            new Date(d.getTime() + 60 * 60 * 1000)
                          );
                        }
                      }
                    }}
                    style={{ marginBottom: spacing.vs2 }}
                  />
                )}

                {/* End picker */}
                <Text style={styles.label}>End</Text>
                <TouchableOpacity
                  style={styles.pickerRow}
                  onPress={() => setEndOpen(!endOpen)}
                >
                  <Ionicons name="calendar" size={20} color={colors.primary} />
                  <Text style={styles.pickerText}>
                    {endTime.toLocaleString()}
                  </Text>
                </TouchableOpacity>
                {endOpen && (
                  <DateTimePicker
                    value={endTime}
                    mode="datetime"
                    display={Platform.OS === 'ios' ? 'spinner' : 'inline'}
                    textColor={colors.text}
                    onChange={(_, d) => {
                      if (d) {
                        if (d <= startTime) {
                          Alert.alert('End must come after Start');
                          return;
                        }
                        setEndTime(d);
                      }
                    }}
                    style={{ marginBottom: spacing.vs2 }}
                  />
                )}

                {/* location / description / buttons */}
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Clark Hall 201"
                  placeholderTextColor={colors.gray400}
                />

                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Agenda, topics…"
                  placeholderTextColor={colors.gray400}
                />

                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[
                      styles.btn,
                      { backgroundColor: colors.gray200 },
                    ]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={[styles.btnText, { color: colors.text }]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary }]}
                    onPress={handleSave}
                  >
                    <Text style={[styles.btnText, { color: colors.white }]}>
                      Save
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
        </Modal>
      </SafeAreaView>
    </PaperProvider>
  );
}

/* ---------- styles (unchanged) ---------- */
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
    paddingVertical: spacing.vs0_5,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardWrapper: { width: '90%' },
  card: {
    backgroundColor: colors.surface ?? '#fff',
    borderRadius: 16,
    padding: spacing.s4,
    width: '100%',
  },
  modalTitle: {
    fontSize: typography.fontXl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.vs2,
  },
  label: {
    marginTop: spacing.vs2,
    marginBottom: 4,
    color: colors.text,
    fontSize: typography.fontSm,
  },
  pickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.s2,
  },
  pickerText: { marginLeft: spacing.s2, color: colors.text },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.s2,
    color: colors.text,
    marginTop: spacing.vs1,
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: spacing.vs3,
  },
  btn: {
    borderRadius: 8,
    paddingVertical: spacing.vs1,
    paddingHorizontal: spacing.s4,
    marginLeft: spacing.s2,
  },
  btnText: { fontSize: typography.fontMd, fontWeight: '500' },
});
