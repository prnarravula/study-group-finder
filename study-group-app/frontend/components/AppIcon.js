import React from 'react';
import { Image, StyleSheet } from 'react-native';
import { spacing, colors, typography } from '../constants';
import { verticalScale } from 'react-native-size-matters';

const AppIcon = ({ size = verticalScale(150) }) => (
  <Image
    source={require('../assets/AppIcon.png')}
    style={[styles.icon, { width: size, height: size }]}
    resizeMode="contain"
  />
);

const styles = StyleSheet.create({
  icon: {
    marginBottom: spacing.vs1,
  },
});

export default AppIcon;
