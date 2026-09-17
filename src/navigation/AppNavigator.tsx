import React from 'react';
import { StyleSheet, Platform, View, ActivityIndicator } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/AuthContext';
import { AuthScreen } from '../screens/AuthScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { FinanceScreen } from '../screens/FinanceScreen';
import { UmkmScreen } from '../screens/UmkmScreen';
import { AdminDashboardScreen } from '../screens/admin/AdminDashboardScreen';
import { AdminAdsScreen } from '../screens/admin/AdminAdsScreen';
import { AdminUmkmScreen } from '../screens/admin/AdminUmkmScreen';
import { AdminUsersScreen } from '../screens/admin/AdminUsersScreen';

export type StudentTabParamList = {
  Home: undefined;
  Schedule: undefined;
  Finance: undefined;
  Umkm: undefined;
};

export type AdminTabParamList = {
  AdminDashboard: undefined;
  AdminAds: undefined;
  AdminUmkm: undefined;
  AdminUsers: undefined;
};

const StudentTab = createBottomTabNavigator<StudentTabParamList>();
const AdminTab = createBottomTabNavigator<AdminTabParamList>();

export const AppNavigator: React.FC = () => {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.accentYellow} />
      </View>
    );
  }

  // If unauthenticated, show AuthScreen (Login / Register student)
  if (!user) {
    return <AuthScreen />;
  }

  // If Admin: render Admin specific tabs.
  // Note: Jadwal and Keuangan are completely blocked and hidden from Admin navigation!
  if (role === 'admin') {
    return (
      <AdminTab.Navigator
        initialRouteName="AdminDashboard"
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarActiveTintColor: Colors.accentYellow,
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
          tabBarStyle: styles.tabBar,
          tabBarLabelStyle: styles.tabBarLabel,
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'speedometer';

            if (route.name === 'AdminDashboard') {
              iconName = focused ? 'speedometer' : 'speedometer-outline';
            } else if (route.name === 'AdminAds') {
              iconName = focused ? 'megaphone' : 'megaphone-outline';
            } else if (route.name === 'AdminUmkm') {
              iconName = focused ? 'storefront' : 'storefront-outline';
            } else if (route.name === 'AdminUsers') {
              iconName = focused ? 'people' : 'people-outline';
            }

            return <Ionicons name={iconName} size={22} color={color} />;
          },
        })}
      >
        <AdminTab.Screen
          name="AdminDashboard"
          component={AdminDashboardScreen}
          options={{ tabBarLabel: 'Dashboard' }}
        />
        <AdminTab.Screen
          name="AdminAds"
          component={AdminAdsScreen}
          options={{ tabBarLabel: 'Kelola Iklan' }}
        />
        <AdminTab.Screen
          name="AdminUmkm"
          component={AdminUmkmScreen}
          options={{ tabBarLabel: 'Kelola UMKM' }}
        />
        <AdminTab.Screen
          name="AdminUsers"
          component={AdminUsersScreen}
          options={{ tabBarLabel: 'Kelola User' }}
        />
      </AdminTab.Navigator>
    );
  }

  // Student (User) Navigation: Full access to Home, Schedule, Finance, UMKM
  return (
    <StudentTab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: Colors.accentYellow,
        tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.5)',
        tabBarStyle: styles.tabBar,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Finance') {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === 'Umkm') {
            iconName = focused ? 'storefront' : 'storefront-outline';
          }

          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <StudentTab.Screen
        name="Home"
        component={HomeScreen}
        options={{ tabBarLabel: 'Beranda' }}
      />
      <StudentTab.Screen
        name="Schedule"
        component={ScheduleScreen}
        options={{ tabBarLabel: 'Jadwal' }}
      />
      <StudentTab.Screen
        name="Finance"
        component={FinanceScreen}
        options={{ tabBarLabel: 'Keuangan' }}
      />
      <StudentTab.Screen
        name="Umkm"
        component={UmkmScreen}
        options={{ tabBarLabel: 'UMKM' }}
      />
    </StudentTab.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#070A13',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tabBar: {
    backgroundColor: '#0A0F1D',
    borderTopColor: '#1A2338',
    borderTopWidth: 1,
    height: Platform.OS === 'ios' ? 86 : 64,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    paddingTop: 8,
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
});