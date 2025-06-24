import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

//screens
import CalendarScreen from './screens/CalendarScreen';
import ChatsScreen from './screens/ChatsScreen';
import EditInfoScreen from './screens/EditInfoScreen';
import FindGroupScreen from './screens/FindGroupScreen';
import HomeScreen from './screens/HomeScreen';
import IndChatScreen from './screens/IndChatScreen';
import LogInScreen from './screens/LogInScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReportScreen from './screens/ReportScreen';
import SignUpScreen from './screens/SignUpScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import YourGroupsScreen from './screens/YourGroupsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="HomeScreen" component={HomeScreen} />
        <Stack.Screen name="SignUpScreen" component={SignUpScreen} /> 
        <Stack.Screen name="LogInScreen" component={LogInScreen} /> 
        <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} /> 
      </Stack.Navigator>
    </NavigationContainer>
  );
}