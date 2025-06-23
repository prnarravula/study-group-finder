import React from 'react';
import { useNavigation } from '@react-navigation/native';
import AuthButton from './AuthButton';

const SignUpButton = () => {
  const navigation = useNavigation();

  return (
    <AuthButton
      label="Sign Up"
      onPress={() => navigation.navigate('SignUpScreen')}
      
    />
  );
};

export default SignUpButton;
