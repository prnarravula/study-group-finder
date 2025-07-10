import React, { useState, useContext, useRef } from 'react';
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  arrayUnion,
  doc,
} from 'firebase/firestore';
import { db } from '../../backend/firebaseConfig';
import { AuthContext } from '../../backend/AuthContext';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';
import uvaCourses from '../../data/uvaCourses';

export default function FindGroupScreen({ navigation }) {
  const { user } = useContext(AuthContext);
  const inputRef = useRef(null);

  const [subject, setSubject] = useState('');
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [publicGroups, setPublicGroups] = useState([]);
  const [joinCode, setJoinCode] = useState('');

  const onAdd = () => {
    const trimmed = subject.trim().toUpperCase();
    if (!uvaCourses.includes(trimmed)) {
      Alert.alert('Invalid subject', `"${trimmed}" is not in the course list.`);
      return;
    }
    if (!selectedSubjects.includes(trimmed)) {
      setSelectedSubjects(s => [...s, trimmed]);
    }
    setSubject('');
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const onRemove = item => {
    setSelectedSubjects(s => s.filter(x => x !== item));
  };

  const doSearch = async () => {
    if (selectedSubjects.length === 0) {
      setPublicGroups([]);
      return;
    }
    const chunkSize = 10;
    let allResults = [];
    for (let i = 0; i < selectedSubjects.length; i += chunkSize) {
      const chunk = selectedSubjects.slice(i, i + chunkSize);
      const q = query(
        collection(db, 'groups'),
        where('isPublic', '==', true),
        where('subject', 'in', chunk)
      );
      const snap = await getDocs(q);
      snap.forEach(d => {
        const data = { id: d.id, ...d.data() };
        if (!data.memberIds?.includes(user.uid)) {
          allResults.push(data);
        }
      });
    }
    const uniq = Object.values(
      allResults.reduce((acc, g) => {
        acc[g.id] = g;
        return acc;
      }, {})
    );
    setPublicGroups(uniq);
  };

  const onJoinCode = async () => {
    const code = joinCode.trim();
    if (!code) {
      Alert.alert('Enter a code', 'Please type a join code first.');
      return;
    }
    const q = query(
      collection(db, 'groups'),
      where('joinCode', '==', code)
    );
    const snap = await getDocs(q);
    if (snap.empty) {
      return Alert.alert('Not found', `No group with code "${code}".`);
    }
    const docSnap = snap.docs[0];
    const g = { id: docSnap.id, ...docSnap.data() };
    const maxEnabled = g.maxCountEnabled ?? g.countEnabled;
    const maxCount = g.maxStudentCount ?? g.count;
    const current = (g.memberIds || []).length;
    if (maxEnabled && current >= maxCount) {
      return Alert.alert('Full', 'This group has reached its max capacity.');
    }
    try {
      await updateDoc(doc(db, 'groups', g.id), {
        memberIds: arrayUnion(user.uid),
      });
      Alert.alert('Joined!', `You’ve joined "${g.name || g.subject}" successfully.`);
      setJoinCode('');
    } catch (e) {
      console.error(e);
      Alert.alert('Error', 'Could not join the group. Try again.');
    }
  };

  const renderGroup = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{item.name || item.subject}</Text>
        <TouchableOpacity onPress={async () => {
          const maxEnabled = item.maxCountEnabled ?? item.countEnabled;
          const maxCount = item.maxStudentCount ?? item.count;
          const current = (item.memberIds || []).length;
          if (maxEnabled && current >= maxCount) {
            return Alert.alert('Full', 'This group is full.');
          }
          try {
            await updateDoc(doc(db, 'groups', item.id), {
              memberIds: arrayUnion(user.uid),
            });
            Alert.alert('Joined!', `You’ve joined "${item.name || item.subject}".`);
            setPublicGroups(g => g.filter(x => x.id !== item.id));
          } catch (e) {
            console.error(e);
            Alert.alert('Error', 'Could not join.');
          }
        }}>
          <Text style={styles.cardJoin}>Join</Text>
        </TouchableOpacity>
      </View>
      {item.description ? (
        <Text style={styles.cardBody}>{item.description}</Text>
      ) : null}
      <View style={styles.cardFooter}>
        <Text style={styles.cardMeta}>Subject: {item.subject}</Text>
        <Text style={styles.cardMeta}>Members: {item.memberIds?.length || 0}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? spacing.vs12 : spacing.vs8
        }
      >
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Find Study Group</Text>
          <Text style={styles.label}>Subject</Text>
          <View style={styles.subjectRow}>
            <View style={styles.subjectBox}>
              <TextInput
                ref={inputRef}
                style={styles.subjectInput}
                value={subject}
                onChangeText={setSubject}
                placeholder="Type subject"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
              />
            </View>
            <TouchableOpacity style={styles.addBtn} onPress={onAdd}>
              <Text style={styles.addBtnText}>Add</Text>
            </TouchableOpacity>
          </View>
          {selectedSubjects.length > 0 && (
            <FlatList
              horizontal
              data={selectedSubjects}
              keyExtractor={i => i}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
              renderItem={({ item }) => (
                <View style={styles.chip}>
                  <TouchableOpacity onPress={() => onRemove(item)}>
                    <Ionicons name="close-circle" size={spacing.s4} color={colors.textSecondary} />
                  </TouchableOpacity>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              )}
            />
          )}
          <View style={styles.searchBtn}>
            <AuthButton label="Search" onPress={doSearch} />
          </View>
        </View>

        <FlatList
          data={publicGroups}
          keyExtractor={g => g.id}
          renderItem={renderGroup}
          contentContainerStyle={styles.listContainer}
          ListEmptyComponent={() => (
            <Text style={styles.noGroups}>No public groups found.</Text>
          )}
          keyboardShouldPersistTaps="handled"
        />

        <View style={styles.joinWrapper}>
          <Text style={styles.joinHeader}>Join Private Group by Code</Text>
          <View style={styles.joinContainer}>
            <TextInput
              style={styles.joinInput}
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="Enter code"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity style={styles.joinBtn} onPress={onJoinCode}>
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },

  headerContainer: {
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.vs4,
    paddingBottom: spacing.vs2,
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  title: {
    fontSize: typography.font3Xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.vs4,
    alignSelf: 'center',
  },
  label: {
    fontSize: typography.fontLg,
    color: colors.text,
    marginBottom: spacing.vs2,
  },
  subjectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.vs3,
  },
  subjectBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    backgroundColor: colors.background,
  },
  subjectInput: {
    paddingHorizontal: spacing.s3,
    paddingVertical: Platform.OS === 'ios' ? spacing.vs3 : spacing.vs2,
    fontSize: typography.fontLg,
    color: colors.text,
  },
  addBtn: {
    marginLeft: spacing.s2,
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs2,
    borderRadius: spacing.s3,
  },
  addBtnText: {
    fontSize: typography.fontLg,
    color: '#fff',
    fontWeight: '600',
  },
  chipScroll: { marginBottom: spacing.vs3 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.vs1,
    borderRadius: spacing.s4,
    marginRight: spacing.s2,
  },
  chipText: {    marginLeft: spacing.s1,    fontSize: typography.fontMd,    color: colors.text,  },
  searchBtn: { alignItems: 'center', marginBottom: spacing.vs2 },

  listContainer: {
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.vs4,
  },
  noGroups: {
    textAlign: 'center',
    color: colors.textSecondary,
    marginTop: spacing.vs4,
  },
  card: {
   backgroundColor: '#fff',
   borderWidth: 1,
   borderColor: colors.border,
   borderRadius: spacing.s3,
   padding: spacing.s4,
  marginVertical: spacing.vs2,
   // subtle shadow for depth
   shadowColor: '#000',
   shadowOffset: { width: 0, height: 1 },
   shadowOpacity: 0.05,
   shadowRadius: 1,
   elevation: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: { fontSize: typography.fontLg, fontWeight: '600', color: colors.text },
  cardJoin: { fontSize: typography.fontMd, color: colors.primary, fontWeight: '500' },
  cardBody: { marginTop: spacing.vs2, fontSize: typography.fontMd, color: colors.textSecondary },
  cardFooter: { marginTop: spacing.vs3, flexDirection: 'row', justifyContent: 'space-between' },
  cardMeta: { fontSize: typography.fontSm, color: colors.textSecondary },

  joinWrapper: {
    borderTopWidth: 1,
    borderColor: colors.border,
    paddingTop: spacing.vs3,
    paddingHorizontal: spacing.s4,
    paddingBottom: spacing.vs4,
    backgroundColor: colors.surface,
  },
  joinHeader: { fontSize: typography.fontLg, fontWeight: '600', color: colors.text, marginBottom: spacing.vs2 },
  joinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    backgroundColor: colors.background,
    overflow: 'hidden',
  },
  joinInput: {
    flex: 1,
    paddingHorizontal: spacing.s3,
    paddingVertical: Platform.OS === 'ios' ? spacing.vs3 : spacing.vs2,
    fontSize: typography.fontLg,
    color: colors.text,
  },
  joinBtn: {
    paddingHorizontal: spacing.s4,
    paddingVertical: Platform.OS === 'ios' ? spacing.vs3 : spacing.vs2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: { fontSize: typography.fontLg, color: '#fff', fontWeight: '600' },
});
