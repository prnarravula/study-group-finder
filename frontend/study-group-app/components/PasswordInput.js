import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
} from 'react-native';
import { colors, typography, spacing } from '../constants';
import EyeFilled from '../assets/eye-filled.png';
import EyeOutline from '../assets/eye-outline.png';

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
        onPress={() => setVisible((v) => !v)}
        style={styles.iconWrapper}
      >
        <Image
          source={visible ? EyeOutline : EyeFilled}
          style={styles.icon}
          resizeMode="contain"
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
    paddingHorizontal: spacing.s4,
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
  },
  icon: {
    width: spacing.s5, 
    height: spacing.s5,
  },
});

export default PasswordInput;
