import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthProvider, AuthContext } from './backend/AuthContext';
import BottomNavBar from './frontend/navigation/BottomNavBar';

// Screens
import CalendarScreen from './frontend/screens/CalendarScreen';
import ChatsScreen from './frontend/screens/ChatsScreen';
import FindGroupScreen from './frontend/screens/FindGroupScreen';
import HomeScreen from './frontend/screens/HomeScreen';
import IndChatScreen from './frontend/screens/IndChatScreen';
import LogInScreen from './frontend/screens/LogInScreen';
import ProfileScreen from './frontend/screens/ProfileScreen';
import SignUpScreen from './frontend/screens/SignUpScreen';
import VerifyEmailScreen from './frontend/screens/VerifyEmailScreen';
import YourGroupsScreen from './frontend/screens/YourGroupsScreen';

// Firebase
import { auth } from './backend/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { user, checking } = React.useContext(AuthContext);
  const isVerified = user && user.emailVerified;

    if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isVerified ? (
        <>
          <Stack.Screen name="BottomNavBar" component={BottomNavBar} />
          <Stack.Screen name="FindGroupScreen" component={FindGroupScreen} />
        </>
      ) : user ? (
        <>
          <Stack.Screen name="VerifyEmailScreen" component={VerifyEmailScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="HomeScreen" component={HomeScreen} />
          <Stack.Screen name="LogInScreen" component={LogInScreen} />
          <Stack.Screen name="SignUpScreen" component={SignUpScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <StatusBar style="auto" />
        <AppNavigator />
      </NavigationContainer>
    </AuthProvider>
  );
}