import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthButton from './AuthButton';
import { colors, typography } from '../constants';

const LogInButton = () => {
  const navigation = useNavigation();

  return (
    <AuthButton
      label="Log In"
      onPress={() => navigation.navigate('LogInScreen')}
      style={{ backgroundColor: colors.secondary, elevation: 0 }}
    />
  );
};

export default LogInButton;
