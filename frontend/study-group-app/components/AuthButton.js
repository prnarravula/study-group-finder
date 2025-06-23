import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { spacing, typography, colors } from '../constants';

const AuthButton = ({ label, onPress, style, textStyle }) => (
  <TouchableOpacity style={[styles.button, style]} onPress={onPress}>
    <Text
      style={[styles.text, textStyle]}
      numberOfLines={1} 
      adjustsFontSizeToFit={true} 
      ellipsizeMode="tail" 
    >
      {label}
    </Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  button: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.vs4,
    paddingHorizontal: spacing.s14,
    borderRadius: spacing.s3,
    marginVertical: spacing.vs1,
    alignSelf: 'stretch',
    alignItems: 'center',
  },
  text: {
    color: colors.white,
    fontSize: typography.fontLg,
    fontWeight: typography.fontWeightBold,
  },
});

export default AuthButton;
