import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants';

const PasswordInput = ({ style, ...props }) => {
  const [visible, setVisible] = useState(false);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        style={styles.input}
        secureTextEntry={!visible}
        placeholderTextColor={colors.placeholder}
        {...props}
      />
      <TouchableOpacity
        onPress={() => setVisible(v => !v)}
        style={styles.iconWrapper}
      >
        <Ionicons
          name={visible ? 'eye-outline' : 'eye-off-outline'}
          size={spacing.s5}
          color={colors.text}
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: spacing.vs11,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: spacing.s3,
    paddingLeft: spacing.s4,
    paddingRight: spacing.s2,
    marginBottom: spacing.vs4,
  },
  input: {
    flex: 1,
    height: '100%',
    padding: 0,
    color: colors.text,
    fontSize: typography.fontMd,
  },
  iconWrapper: {
    padding: spacing.s2,
    marginLeft: spacing.s2,
  },
});

export default PasswordInput;
