import React from 'react';
import { TextInput, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '../constants';

const InputField = ({ style, ...props }) => (
  <TextInput
    style={[styles.input, style]}
    placeholderTextColor={colors.placeholder}
    {...props}
  />
);

const styles = StyleSheet.create({
  input: {
    height: spacing.vs11,          
    backgroundColor: colors.background, 
    borderWidth: 2,
    borderColor: colors.border,      
    borderRadius: spacing.s3,       
    paddingHorizontal: spacing.s4,   
    marginBottom: spacing.vs4, 
    color: colors.text,
    fontSize: typography.fontMd,
  },
});

export default InputField;
