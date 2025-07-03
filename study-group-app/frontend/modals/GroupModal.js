import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Switch,
  FlatList,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';
import uvaCourses from '../../data/uvaCourses';

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

  // case-sensitive filter-as-you-type
  const filteredSubjects = uvaCourses.filter(opt =>
    opt.toLowerCase().includes(subject.toLowerCase())
  );

  // validation flags
  const nameIsValid = name.trim().length > 0;
  const subjectIsValid = uvaCourses.includes(subject);
  const formIsValid = nameIsValid && subjectIsValid;

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

  const renderSubject = ({ item }) => (
    <TouchableOpacity
      style={styles.dropdownItem}
      onPress={() => {
        setSubject(item);
        setShowSubjectDropdown(false);
      }}
    >
      <Text style={styles.dropdownText}>{item}</Text>
    </TouchableOpacity>
  );

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

          <View style={styles.formContainer}>
            {/* Group Name */}
            <Text style={styles.label}>Group Name</Text>
            <TextInput
              style={[styles.input, !nameIsValid && styles.inputError]}
              value={name}
              onChangeText={setName}
              placeholder="Enter group name"
              placeholderTextColor={colors.text}
            />
            {!nameIsValid && (
              <Text style={styles.errorText}>Group name is required.</Text>
            )}

            {/* Subject */}
            <Text style={styles.label}>Subject</Text>
            <View style={styles.selectContainer}>
              <TextInput
                style={[
                  styles.subjectInput,
                  (!subjectIsValid || subject.trim() === '') && styles.inputError
                ]}
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
                onPress={() => setShowSubjectDropdown(v => !v)}
              >
                <Ionicons
                  name="chevron-down-outline"
                  size={spacing.s4}
                  color={colors.textSecondary}
                />
              </TouchableOpacity>
            </View>
            {subject.trim() === '' ? (
              <Text style={styles.errorText}>Subject is required.</Text>
            ) : !subjectIsValid ? (
              <Text style={styles.errorText}>Please select a valid subject.</Text>
            ) : null}

            {showSubjectDropdown && (
              <FlatList
                style={styles.dropdown}
                data={filteredSubjects}
                keyExtractor={item => item}
                renderItem={renderSubject}
                keyboardShouldPersistTaps="handled"
                nestedScrollEnabled
                initialNumToRender={20}
                maxToRenderPerBatch={20}
              />
            )}

            {/* Description */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.multiline]}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
              placeholderTextColor={colors.text}
            />

            {/* Count */}
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

            {/* Public */}
            <View style={styles.row}>
              <Text style={styles.label}>Public</Text>
              <Switch value={isPublic} onValueChange={setIsPublic} />
            </View>
          </View>

          {/* Submit */}
          <AuthButton
            label={submitText}
            onPress={() => formIsValid && onSubmit({ name, subject, description, count, isPublic, countEnabled })}
            disabled={!formIsValid}
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
  formContainer: {
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
    marginBottom: spacing.vs1,
    backgroundColor: colors.surface ?? colors.background,
    color: colors.text,
  },
  inputError: {
    borderColor: 'red',
  },
  errorText: {
    color: 'red',
    marginBottom: spacing.vs2,
    fontSize: typography.fontSm,
  },
  multiline: {
    height: spacing.vs10,
    textAlignVertical: 'top',
    marginBottom: spacing.vs3,
  },
  selectContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    marginBottom: spacing.vs1,
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
