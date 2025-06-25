import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AuthButton from '../components/AuthButton';
import { colors, typography, spacing } from '../constants';

export default function EditInfoModal({
  visible,
  initialValues = { name: '', email: '', phone: '' },
  onSubmit,
  onClose,
}) {
  const [name, setName]   = useState(initialValues.name);
  const [email]          = useState(initialValues.email);
  const [phone, setPhone] = useState(initialValues.phone);

  useEffect(() => {
    setName(initialValues.name);
    setPhone(initialValues.phone);
  }, [initialValues, visible]);

  return (
    <Modal visible={visible} transparent animationType="fade">
      {/* dark backdrop */}
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop} />
      </TouchableWithoutFeedback>

      {/* container that centers the modalView */}
      <View style={styles.overlay}>
        <View style={styles.modalView}>
          {/* Header row */}
          <View style={styles.headerRow}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={styles.title}>Edit Information</Text>
            {/* Spacer so title stays centered */}
            <View style={{ width: 24 }} />
          </View>

          {/* Full Name */}
          <Text style={styles.label}>Full Name</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="John Doe"
          />

          {/* Email (disabled) */}
          <Text style={styles.label}>Email</Text>
          <View style={styles.disabledWrapper}>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={email}
              editable={false}
              placeholder="email@example.com"
            />
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textSecondary}
              style={styles.lockIcon}
            />
          </View>

          {/* Phone */}
          <Text style={styles.label}>Phone (optional)</Text>
          <TextInput
            style={styles.input}
            value={phone}
            onChangeText={setPhone}
            placeholder="Enter phone"
            keyboardType="phone-pad"
          />

          {/* Save Changes */}
          <AuthButton
            label="Save Changes"
            onPress={() => onSubmit({ name, email, phone })}
            style={styles.saveBtn}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  overlay: {
    // This view sits on top of the backdrop and centers its children
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
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
  label: {
    fontSize: typography.fontMd,
    color: colors.text,
    marginBottom: spacing.vs1,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.s2,
    padding: spacing.s2,
    marginBottom: spacing.vs3,
    fontSize: typography.fontMd,
    color: colors.text,
    backgroundColor: colors.surface ?? colors.background,
  },
  disabledWrapper: {
    position: 'relative',
    marginBottom: spacing.vs3,
  },
  inputDisabled: {
    color: colors.textSecondary,
    backgroundColor: colors.surface ?? '#f5f5f5',
  },
  lockIcon: {
    position: 'absolute',
    right: spacing.s2,
    top: spacing.vs2,
  },
  saveBtn: {
    marginTop: spacing.vs4,
  },
});