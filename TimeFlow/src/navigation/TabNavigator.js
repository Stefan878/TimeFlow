import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialCommunityIcons } from '@expo/vector-icons';

import HomeScreen from '../screens/HomeScreen';
import AddTaskScreen from '../screens/AddTaskScreen';
import AnalyticsScreen from '../screens/AnalyticsScreen';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
      }}
    >
      {/* Home */}
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="home-outline"
              size={28}
              color={focused ? '#4c6ef5' : '#777'}
            />
          ),
        }}
      />

      {/* Add Task */}
      <Tab.Screen
        name="AddTask"
        component={AddTaskScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={styles.addButtonWrapper}>
              <View style={styles.addButton}>
                <MaterialCommunityIcons name="plus" size={32} color="#fff" />
              </View>
            </View>
          ),
        }}
      />

      {/* 2. Calendar (НОВО) */}
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name={focused ? "calendar-month" : "calendar-month-outline"}
              size={28}
            />
          ),
        }}
      />

      {/* Analytics */}
      <Tab.Screen
        name="Analytics"
        component={AnalyticsScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <MaterialCommunityIcons
              name="chart-line"
              size={28}
              color={focused ? '#4c6ef5' : '#777'}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 30,       // отстъп отстрани
    right: 30,      // отстъп отстрани
    height: 70,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 10 },
    shadowRadius: 10,
    elevation: 10,
    flexDirection: 'row',
    justifyContent: 'space-around', // центрирани табове
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  addButtonWrapper: {
    top: -30,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addButton: {
    width: 65,
    height: 65,
    borderRadius: 32.5,
    backgroundColor: '#4c6ef5',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4c6ef5',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 8 },
    shadowRadius: 10,
    elevation: 6,
  },
});
