import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import {HomeScreen} from '../screens/HomeScreen';
import SessionTypesScreen from '../screens/SessionTypesScreen';
import AvailabilityScreen from '../screens/AvailabilityScreen';
import CreateSessionScreen from '../screens/CreateSessionScreen';
import ProgressScreen from '../screens/ProgressScreen';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
 <Tab.Navigator
  screenOptions={({ route }) => ({
    tabBarIcon: ({ color, size }) => {
      let iconName: string = '';

      if (route.name === 'Home') iconName = 'home';
      else if (route.name === 'Session Types') iconName = 'list';
      else if (route.name === 'Availability') iconName = 'calendar';
      else if (route.name === 'Create Session') iconName = 'add-circle';
      else if (route.name === 'Progress') iconName = 'stats-chart';

      return <Ionicons name={iconName as any} size={size} color={color} />;
    },
    tabBarActiveTintColor: 'tomato',
    tabBarInactiveTintColor: 'gray',
  })}
>
  <Tab.Screen name="Home" component={HomeScreen} />
  <Tab.Screen name="Session Types" component={SessionTypesScreen} />
  <Tab.Screen name="Availability" component={AvailabilityScreen} />
  <Tab.Screen name="Create Session" component={CreateSessionScreen} />
  <Tab.Screen name="Progress" component={ProgressScreen} />
</Tab.Navigator>
    </NavigationContainer>
  );
}