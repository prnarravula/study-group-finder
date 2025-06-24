import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';

export default function FindGroupScreen({ navigation }) {
  const [subject, setSubject] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);

  // TODO: Replace with real subject options
  const subjectOptions = [
    'Math', 'Science', 'History', 'Art',
    'Biology', 'Chemistry', 'English', 'Music',
  ];
  const filtered = subjectOptions.filter(opt =>
    opt.toLowerCase().includes(subject.toLowerCase())
  );

  useEffect(() => {
    setShowDropdown(false);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled
      >
        <Text style={styles.title}>Find Study Group</Text>

        {/* Subject dropdown as the search */}
        <Text style={styles.label}>Subject</Text>
        <View style={styles.selectContainer}>
          <TextInput
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
        {showDropdown && filtered.length > 0 && (
          <ScrollView
            style={styles.dropdown}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            scrollEnabled
          >
            {filtered.map(opt => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  setSubject(opt);
                  setShowDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        <Text style={[styles.subheader, { marginTop: spacing.vs6 }]}>
          Public Groups
        </Text>
        <View style={styles.placeholder} />

        <View style={styles.buttonContainer}>
          <AuthButton
            label="Search"
            onPress={() => {
              // TODO: implement search
            }}
            textStyle={{ fontSize: typography.fontLg }}
          />
        </View>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.cancelLink}
        >
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    paddingHorizontal: spacing.s4,
    paddingTop: spacing.vs4,
    paddingBottom: spacing.vs4,
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
    borderRadius: spacing.s2,
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
  },
  dropdown: {
    maxHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    backgroundColor: colors.background,
    marginTop: -spacing.vs2,
    marginBottom: spacing.vs3,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: spacing.vs2,
    paddingHorizontal: spacing.s3,
  },
  dropdownText: {
    fontSize: typography.fontLg,   
    color: colors.text,
  },
  subheader: {
    fontSize: typography.fontXl,   
    fontWeight: 'bold',
    color: colors.text,
  },
  placeholder: {
    height: 200, // will be replaced with actual group list
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
});
