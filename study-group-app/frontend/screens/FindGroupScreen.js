import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';
import uvaCourses from '../../data/uvaCourses';

export default function FindGroupScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [inviteCode, setInviteCode] = useState('');
  const inputRef = useRef(null);

  const filtered = uvaCourses.filter(opt =>
    opt.toLowerCase().includes(subject.toLowerCase())
  );

  const onSelectSubject = item => {
    if (item && !selectedSubjects.includes(item)) {
      setSelectedSubjects(prev => [...prev, item]);
    }
    setSubject('');
    setShowDropdown(false);
    inputRef.current?.blur();
  };

  const onRemoveSubject = item =>
    setSelectedSubjects(prev => prev.filter(s => s !== item));

  useEffect(() => {
    setShowDropdown(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={spacing.vs8}
        style={styles.flex}
      >
        <View style={styles.container}>
          <Text style={styles.title}>Find Study Group</Text>

          <Text style={styles.label}>Subject</Text>
          <View style={styles.selectContainer}>
            <TextInput
              ref={inputRef}
              style={styles.subjectInput}
              value={subject}
              onChangeText={text => {
                setSubject(text);
                setShowDropdown(true);
              }}
              placeholder="Type or select subject"
              placeholderTextColor={colors.textSecondary}
              onFocus={() => setShowDropdown(true)}
            />
            <TouchableOpacity
              style={styles.chevron}
              onPress={() => setShowDropdown(prev => !prev)}
            >
              <Ionicons
                name="chevron-down-outline"
                size={spacing.s4}
                color={colors.textSecondary}
              />
            </TouchableOpacity>
          </View>

          {showDropdown && (
            <FlatList
              style={styles.dropdown}
              data={filtered}
              keyExtractor={item => item}
              keyboardShouldPersistTaps="handled"
              initialNumToRender={20}
              maxToRenderPerBatch={20}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.dropdownItem}
                  onPress={() => onSelectSubject(item)}
                >
                  <Text style={styles.dropdownText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          )}

          {selectedSubjects.length > 0 && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.chipScroll}
            >
              {selectedSubjects.map(item => (
                <View key={item} style={styles.chip}>
                  <TouchableOpacity onPress={() => onRemoveSubject(item)}>
                    <Ionicons
                      name="close-circle"
                      size={spacing.s4}
                      color={colors.textSecondary}
                    />
                  </TouchableOpacity>
                  <Text style={styles.chipText}>{item}</Text>
                </View>
              ))}
            </ScrollView>
          )}

          <Text style={[styles.subheader, { marginTop: spacing.vs4 }]}>
            Public Groups
          </Text>
          <View style={styles.placeholder} />

          <View style={styles.buttonContainer}>
            <AuthButton
              label="Search"
              onPress={() => {/* TODO: implement search */}}
              textStyle={{ fontSize: typography.fontLg }}
            />
          </View>

          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.cancelLink}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.joinWrapper}>
          <Text style={styles.joinHeader}>Join Private Group by Code</Text>
          <View style={styles.joinContainer}>
            <TextInput
              style={styles.joinInput}
              value={inviteCode}
              onChangeText={setInviteCode}
              placeholder="Enter code"
              placeholderTextColor={colors.textSecondary}
            />
            <TouchableOpacity
              style={styles.joinBtn}
              onPress={() => {/* TODO: handle join */}}
            >
              <Text style={styles.joinBtnText}>Join</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.vs4,
    paddingBottom: spacing.vs2,
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
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  subjectInput: {
    flex: 1,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.vs2,
    fontSize: typography.fontLg,
    color: colors.text,
  },
  chevron: {
    padding: spacing.s2,
    backgroundColor: colors.surface,
  },
  dropdown: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    backgroundColor: colors.surface,
    width: '100%',
  },
  dropdownItem: {
    paddingVertical: spacing.vs2,
    paddingHorizontal: spacing.s3,
  },
  dropdownText: {
    fontSize: typography.fontLg,
    color: colors.text,
  },
  chipScroll: {
    flexDirection: 'row',
    paddingLeft: 0,
    marginTop: spacing.vs1,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.s2,
    borderRadius: spacing.s4,
    marginRight: spacing.s2,
  },
  chipText: {
    marginLeft: spacing.s1,
    fontSize: typography.fontMd,
    color: colors.text,
    lineHeight: typography.fontMd + 2,
  },
  subheader: {
    fontSize: typography.fontXl,
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    height: 200,
  },
  buttonContainer: {
    marginTop: spacing.vs6,
    alignItems: 'center',
  },
  cancelLink: {
    marginTop: spacing.vs2,
    alignSelf: 'center',
  },
  cancelText: {
    fontSize: typography.fontMd,
    color: colors.primary,
  },
  joinWrapper: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs3,
    backgroundColor: colors.background,
  },
  joinHeader: {
    fontSize: typography.fontLg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.vs2,
  },
  joinContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  joinInput: {
    flex: 1,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.vs2,
    fontSize: typography.fontLg,
    color: colors.text,
  },
  joinBtn: {
    paddingHorizontal: spacing.s4,
    paddingVertical: spacing.vs2,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  joinBtnText: {
    fontSize: typography.fontLg,
    color: '#fff',
    fontWeight: '600',
  },
});