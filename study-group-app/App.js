import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomNavBar from './frontend/navigation/BottomNavBar';

//screens
import CalendarScreen from './frontend/screens/CalendarScreen';
import ChatsScreen from './frontend/screens/ChatsScreen';
import FindGroupScreen from './frontend/screens/FindGroupScreen';
import HomeScreen from './frontend/screens/HomeScreen';
import IndChatScreen from './frontend/screens/IndChatScreen';
import LogInScreen from './frontend/screens/LogInScreen';
import ProfileScreen from './frontend/screens/ProfileScreen';
import ReportScreen from './frontend/screens/ReportScreen';
import SignUpScreen from './frontend/screens/SignUpScreen';
import VerifyEmailScreen from './frontend/screens/VerifyEmailScreen';
import YourGroupsScreen from './frontend/screens/YourGroupsScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName="HomeScreen"
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="HomeScreen"        component={HomeScreen} />
        <Stack.Screen name="SignUpScreen"      component={SignUpScreen} />
        <Stack.Screen name="LogInScreen"       component={LogInScreen} />
        <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} />
        <Stack.Screen name="BottomNavBar"      component={BottomNavBar} />
        <Stack.Screen name="FindGroupScreen" component={FindGroupScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}