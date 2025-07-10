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
  const { chatId, title } = route.params;
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
  
  // Platform-specific date picker states
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [datePickerMode, setDatePickerMode] = useState('date'); // 'date' or 'time'
  const [currentPickerType, setCurrentPickerType] = useState('start'); // 'start' or 'end'

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
      Alert.alert('Missing Information', 'Please fill out every field');
      return;
    }
    if (endTime <= startTime) {
      Alert.alert('Invalid Time', 'End time must be after start time');
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
      Alert.alert('Error', 'Could not save session.');
    }
  };

  /* ── Android date picker handlers ── */
  const showDatePicker = (type, mode) => {
    setCurrentPickerType(type);
    setDatePickerMode(mode);
    setShowStartPicker(type === 'start');
    setShowEndPicker(type === 'end');
  };

  const onDateChange = (event, selectedDate) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(false);
      setShowEndPicker(false);
    }
    
    if (selectedDate) {
      if (currentPickerType === 'start') {
        setStartTime(selectedDate);
        if (selectedDate >= endTime) {
          setEndTime(new Date(selectedDate.getTime() + 60 * 60 * 1000));
        }
      } else {
        if (selectedDate <= startTime) {
          Alert.alert('Invalid Time', 'End time must be after start time');
          return;
        }
        setEndTime(selectedDate);
      }
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

  /* ── Platform-specific date picker renderers ── */
  const renderIOSDatePicker = () => (
    <>
      {/* Start picker */}
      <Text style={styles.label}>Start Time</Text>
      <View style={styles.iosPickerContainer}>
        <DateTimePicker
          value={startTime}
          mode="datetime"
          display="compact"
          onChange={(event, date) => {
            if (date) {
              setStartTime(date);
              if (date >= endTime) {
                setEndTime(new Date(date.getTime() + 60 * 60 * 1000));
              }
            }
          }}
          style={styles.iosDatePicker}
        />
      </View>

      {/* End picker */}
      <Text style={styles.label}>End Time</Text>
      <View style={styles.iosPickerContainer}>
        <DateTimePicker
          value={endTime}
          mode="datetime"
          display="compact"
          onChange={(event, date) => {
            if (date) {
              if (date <= startTime) {
                Alert.alert('Invalid Time', 'End time must be after start time');
                return;
              }
              setEndTime(date);
            }
          }}
          style={styles.iosDatePicker}
        />
      </View>
    </>
  );

  const renderAndroidDatePicker = () => (
    <>
      {/* Start time */}
      <Text style={styles.label}>Start Time</Text>
      <View style={styles.androidPickerRow}>
        <TouchableOpacity
          style={styles.androidPickerButton}
          onPress={() => showDatePicker('start', 'date')}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.androidPickerText}>
            {startTime.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.androidPickerButton}
          onPress={() => showDatePicker('start', 'time')}
        >
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={styles.androidPickerText}>
            {startTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* End time */}
      <Text style={styles.label}>End Time</Text>
      <View style={styles.androidPickerRow}>
        <TouchableOpacity
          style={styles.androidPickerButton}
          onPress={() => showDatePicker('end', 'date')}
        >
          <Ionicons name="calendar" size={20} color={colors.primary} />
          <Text style={styles.androidPickerText}>
            {endTime.toLocaleDateString()}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.androidPickerButton}
          onPress={() => showDatePicker('end', 'time')}
        >
          <Ionicons name="time" size={20} color={colors.primary} />
          <Text style={styles.androidPickerText}>
            {endTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Android DateTimePicker */}
      {(showStartPicker || showEndPicker) && (
        <DateTimePicker
          value={currentPickerType === 'start' ? startTime : endTime}
          mode={datePickerMode}
          display="default"
          onChange={onDateChange}
        />
      )}
    </>
  );

  /* ── Platform-specific menu renderer ── */
  const renderMenu = () => {
    if (Platform.OS === 'ios') {
      return (
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
      );
    }

    // Android - Simple ActionSheet-style modal
    return (
      <>
        <TouchableOpacity
          style={styles.headerRight}
          onPress={() => setMenuVisible(true)}
        >
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
        
        <Modal
          visible={menuVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMenuVisible(false)}
        >
          <TouchableOpacity
            style={styles.androidMenuOverlay}
            activeOpacity={1}
            onPress={() => setMenuVisible(false)}
          >
            <View style={styles.androidMenuContainer}>
              <TouchableOpacity
                style={styles.androidMenuItem}
                onPress={() => {
                  setMenuVisible(false);
                  navigation.goBack();
                }}
              >
                <Ionicons name="arrow-back" size={20} color={colors.text} />
                <Text style={styles.androidMenuText}>Go Back</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.androidMenuItem}
                onPress={openSchedule}
              >
                <Ionicons name="calendar" size={20} color={colors.text} />
                <Text style={styles.androidMenuText}>Schedule Session</Text>
              </TouchableOpacity>
              
              {canDeleteSession && (
                <TouchableOpacity
                  style={styles.androidMenuItem}
                  onPress={() => {
                    setMenuVisible(false);
                    confirmDeleteSession();
                  }}
                >
                  <Ionicons name="trash" size={20} color={colors.error ?? '#E30425'} />
                  <Text style={[styles.androidMenuText, { color: colors.error ?? '#E30425' }]}>
                    Delete Session
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </TouchableOpacity>
        </Modal>
      </>
    );
  };

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

            {renderMenu()}
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

        {/* Schedule Session Modal */}
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
                showsVerticalScrollIndicator={false}
              >
                <Text style={styles.modalTitle}>Schedule Session</Text>
                
                {/* Platform-specific date pickers */}
                {Platform.OS === 'ios' ? renderIOSDatePicker() : renderAndroidDatePicker()}

                {/* Location */}
                <Text style={styles.label}>Location</Text>
                <TextInput
                  style={styles.input}
                  value={location}
                  onChangeText={setLocation}
                  placeholder="e.g., Clark Hall 201"
                  placeholderTextColor={colors.gray400}
                />

                {/* Description */}
                <Text style={styles.label}>Description</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  multiline
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Agenda, topics…"
                  placeholderTextColor={colors.gray400}
                  textAlignVertical="top"
                />

                {/* Buttons */}
                <View style={styles.btnRow}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.gray200 }]}
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

/* ---------- styles ---------- */
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
  cardWrapper: { width: '90%', maxHeight: '80%' },
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
    marginBottom: 8,
    color: colors.text,
    fontSize: typography.fontSm,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.s2,
    color: colors.text,
    fontSize: typography.fontMd,
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

  // iOS-specific styles
  iosPickerContainer: {
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    marginBottom: spacing.vs2,
    paddingHorizontal: spacing.s2,
  },
  iosDatePicker: {
    height: 120,
  },

  // Android-specific styles
  androidPickerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.vs2,
  },
  androidPickerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gray300,
    borderRadius: 8,
    padding: spacing.s2,
    flex: 0.48,
  },
  androidPickerText: {
    marginLeft: spacing.s2,
    color: colors.text,
    fontSize: typography.fontMd,
  },
  androidMenuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  androidMenuContainer: {
    backgroundColor: colors.surface ?? '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingVertical: spacing.vs2,
  },
  androidMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.vs2,
    paddingHorizontal: spacing.s4,
  },
  androidMenuText: {
    marginLeft: spacing.s3,
    fontSize: typography.fontMd,
    color: colors.text,
  },
});