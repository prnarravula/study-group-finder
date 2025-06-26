import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet
} from 'react-native';
import InputField from '../components/InputField';
import AuthButton from '../components/AuthButton';
import { spacing, colors, typography } from '../constants';


const ResetPasswordModal = ({ visible, onClose, onReset }) => {
  const [email, setEmail] = useState('');

  const handleReset = () => {
    onReset(email);
    setEmail('');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Reset Password</Text>

          <Text style={styles.label}>Email</Text>
          <InputField
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />

          <AuthButton
            label="Reset"
            onPress={handleReset}
            style={styles.button}
            textStyle={styles.buttonText}
          />

          <TouchableOpacity onPress={onClose} style={styles.modalClose}>
            <Text style={styles.link}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: colors.background,
    borderRadius: spacing.s4,
    padding: spacing.s5,
  },
  modalTitle: {
    fontSize: typography.fontLg,
    fontWeight: typography.fontWeightBold,
    marginBottom: spacing.vs4,
    textAlign: 'center',
  },
  label: {
    fontSize: typography.fontSm,
    color: colors.muted,
    marginBottom: spacing.s2,
  },
  button: {
    marginTop: spacing.vs1,
    paddingVertical: spacing.vs4,
    borderRadius: spacing.s5,
  },
  buttonText: {
    fontSize: typography.fontMd,
    fontWeight: typography.fontWeightBold,
  },
  modalClose: {
    marginTop: spacing.vs3,
    alignSelf: 'center',
  },
  link: {
    color: colors.primary,
    fontWeight: typography.fontWeightBold,
    fontSize: typography.fontSm
  },
});

export default ResetPasswordModal;
