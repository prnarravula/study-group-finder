import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../constants';
import YourGroupsScreen from '../screens/YourGroupsScreen';
import ChatsScreen from '../screens/ChatsScreen';
import CalendarScreen from '../screens/CalendarScreen';
import ProfileScreen from '../screens/ProfileScreen';

const Tab = createBottomTabNavigator();

const BottomNavBar = () => (
  <Tab.Navigator
    initialRouteName="Groups"
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        let iconName;
        switch (route.name) {
          case 'Groups':   iconName = 'people-outline';    break;
          case 'Chat':     iconName = 'chatbubble-outline';break;
          case 'Calendar': iconName = 'calendar-outline';  break;
          case 'Profile':  iconName = 'person-outline';    break;
          default:         iconName = 'ellipse';
        }
        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: 'gray',

      tabBarIconStyle:  { marginTop:    0 },
      tabBarLabelStyle: { fontSize: typography.fontSm, marginBottom: 0 },
      tabBarItemStyle:  { paddingVertical: spacing.vs1 },

      tabBarStyle: {
        paddingVertical:    0,
        borderTopWidth:     2,
        borderTopColor:     colors.border,
        backgroundColor:    colors.background,
        elevation:          0,
      },
    })}
  >
    <Tab.Screen name="Groups"   component={YourGroupsScreen} />
    <Tab.Screen name="Chat"     component={ChatsScreen} />
    <Tab.Screen name="Calendar" component={CalendarScreen} />
    <Tab.Screen name="Profile"  component={ProfileScreen} />
  </Tab.Navigator>
);

export default BottomNavBar;
