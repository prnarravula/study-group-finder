import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';

export default function GroupModal({
  visible,
  mode = 'create',
  initialValues = {},
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialValues.name || '');
  const [subject, setSubject] = useState(initialValues.subject || '');
  const [description, setDescription] = useState(initialValues.description || '');
  const [count, setCount] = useState(initialValues.count || 1);
  const [isPublic, setIsPublic] = useState(initialValues.isPublic ?? false);
  const [countEnabled, setCountEnabled] = useState(initialValues.countEnabled ?? true);
  const [showSubjectDropdown, setShowSubjectDropdown] = useState(false);

  // TODO: replace placeholder subject data
  const subjectOptions = ['Math','Science','History','Art','Biology','Chemistry','English','Music'];
  const filteredSubjects = subjectOptions.filter(opt =>
    opt.toLowerCase().includes(subject.toLowerCase())
  );

  useEffect(() => {
    setName(initialValues.name || '');
    setSubject(initialValues.subject || '');
    setDescription(initialValues.description || '');
    setCount(initialValues.count || 1);
    setIsPublic(initialValues.isPublic ?? false);
    setCountEnabled(initialValues.countEnabled ?? true);
    setShowSubjectDropdown(false);
  }, [initialValues, visible]);

  const titleText = mode === 'edit' ? 'Edit Group' : 'Create Group';
  const submitText = mode === 'edit' ? 'Save Changes' : 'Create';

  return (
    <Modal visible={visible} transparent animationType="fade">
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          <View style={styles.headerRow}>
            <Text style={styles.title}>{titleText}</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.cancel}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Enter group name"
              placeholderTextColor={colors.text}
            />

            <Text style={styles.label}>Subject</Text>
            <View style={styles.selectContainer}>
              <TextInput
                style={styles.subjectInput}
                value={subject}
                onChangeText={text => {
                  setSubject(text);
                  setShowSubjectDropdown(true);
                }}
                placeholder="Type or select subject"
                placeholderTextColor={colors.text}
                onFocus={() => setShowSubjectDropdown(true)}
              />
              <TouchableOpacity
                style={styles.chevron}
                onPress={() => setShowSubjectDropdown(prev => !prev)}
              >
                <Ionicons
                  name="chevron-down-outline"
                  size={spacing.s4}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>

            {showSubjectDropdown && filteredSubjects.length > 0 && (
              <ScrollView
                style={styles.dropdown}
                nestedScrollEnabled
                keyboardShouldPersistTaps="handled"
                scrollEnabled
              >
                {filteredSubjects.map(opt => (
                  <TouchableOpacity
                    key={opt}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setSubject(opt);
                      setShowSubjectDropdown(false);
                    }}
                  >
                    <Text style={styles.dropdownText}>{opt}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={colors.text}
              multiline
            />

            <View style={styles.row}>
              <Text style={styles.label}>Max Student Count</Text>
              <View style={styles.enableContainer}>
                <Text style={styles.enableLabel}>Enable</Text>
                <Switch value={countEnabled} onValueChange={setCountEnabled} />
              </View>
            </View>

            <View style={[styles.counterRow, !countEnabled && styles.disabled]}>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => setCount(c => Math.max(1, c - 1))}
                disabled={!countEnabled}
              >
                <Text style={[styles.countBtnText, !countEnabled && styles.disabledText]}>
                  −
                </Text>
              </TouchableOpacity>
              <Text style={[styles.countText, !countEnabled && styles.disabledText]}>
                {count}
              </Text>
              <TouchableOpacity
                style={styles.countBtn}
                onPress={() => setCount(c => c + 1)}
                disabled={!countEnabled}
              >
                <Text style={[styles.countBtnText, !countEnabled && styles.disabledText]}>
                  +
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>Public</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          </ScrollView>

          <AuthButton
            label={submitText}
            onPress={() =>
              onSubmit({ name, subject, description, count, isPublic, countEnabled })
            }
            style={styles.submitBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: colors.background,
    borderRadius: spacing.s4,
    padding: spacing.s4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.vs3,
  },
  title: {
    fontSize: typography.fontLg,
    fontWeight: 'bold',
    color: colors.text,
  },
  cancel: {
    fontSize: typography.fontMd,
    color: colors.primary,
  },
  scrollContent: {
    paddingBottom: spacing.vs2,
  },
  label: {
    fontSize: typography.fontMd,
    color: colors.text,
    marginBottom: spacing.vs1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.vs2,
    marginBottom: spacing.vs3,
    backgroundColor: colors.surface ?? colors.background,
    color: colors.text,
  },
  multiline: {
    height: spacing.vs10,
    textAlignVertical: 'top',
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    marginBottom: spacing.vs2,
  },
  subjectInput: {
    flex: 1,
    paddingHorizontal: spacing.s2,
    paddingVertical: spacing.vs2,
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
    marginBottom: spacing.vs3,
    zIndex: 10,
  },
  dropdownItem: {
    paddingVertical: spacing.vs2,
    paddingHorizontal: spacing.s2,
  },
  dropdownText: {
    fontSize: typography.fontMd,
    color: colors.text,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.vs3,
  },
  counterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.vs3,
  },
  countBtn: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    paddingHorizontal: spacing.s3,
    paddingVertical: spacing.vs1,
  },
  countBtnText: {
    fontSize: typography.fontLg,
    color: colors.text,
  },
  countText: {
    marginHorizontal: spacing.s3,
    fontSize: typography.fontMd,
    color: colors.text,
  },
  enableContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  enableLabel: {
    fontSize: typography.fontMd,
    color: colors.text,
    marginRight: spacing.s2,
  },
  submitBtn: {
    marginTop: spacing.vs3,
  },
  disabled: {
    opacity: 0.4,
  },
  disabledText: {
    color: colors.textSecondary,
  },
});