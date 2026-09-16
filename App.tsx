import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Colors } from './src/constants/colors';
import { notificationService } from './src/services/notificationService';

export default function App() {
  useEffect(() => {
    // Inisialisasi izin notifikasi multiplatform dan kirim notifikasi selamat datang ke notification center
    const initNotifications = async () => {
      try {
        const granted = await notificationService.init();
        if (granted) {
          setTimeout(() => {
            notificationService.sendWelcomeNotification().catch(() => {});
          }, 1500);
        }
      } catch (err) {
        console.warn('Notification init error on startup:', err);
      }
    };
    initNotifications();
  }, []);

  return (
    <SafeAreaProvider style={styles.provider}>
      <View style={styles.root}>
        <StatusBar style="light" backgroundColor={Colors.background} />
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  provider: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: Colors.background,
  },
  root: {
    flex: 1,
    height: '100%',
    width: '100%',
    backgroundColor: Colors.background,
  },
});