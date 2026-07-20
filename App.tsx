import React from 'react';
import { Platform, StyleSheet, View, useWindowDimensions } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import {
  useFonts,
  Archivo_400Regular,
  Archivo_600SemiBold,
  Archivo_800ExtraBold,
} from '@expo-google-fonts/archivo';

import { colors, radius, shadow } from './theme';
import { StoreProvider } from './store/store';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { HomeScreen } from './screens/HomeScreen';
import { ChoresScreen } from './screens/ChoresScreen';
import { PaydayScreen } from './screens/PaydayScreen';
import { FamilyScreen } from './screens/FamilyScreen';

const Tab = createBottomTabNavigator();
const isWeb = Platform.OS === 'web';

// iPhone dimensions from the prototype's device frame (402 × 874).
const PHONE_W = 402;
const PHONE_H = 874;

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, border: colors.divider },
};

/**
 * On web, constrain the app to an iPhone-sized column centered on a backdrop
 * (RN Web otherwise stretches to the full window). On a real device this is a
 * plain full-screen flex container.
 */
function DeviceFrame({ children }: { children: React.ReactNode }) {
  const { height } = useWindowDimensions();
  if (!isWeb) return <View style={styles.root}>{children}</View>;
  return (
    <View style={styles.backdrop}>
      <View style={[styles.phone, { height: Math.min(height - 32, PHONE_H) }, shadow.lg]}>{children}</View>
    </View>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({
    Archivo_400Regular,
    Archivo_600SemiBold,
    Archivo_800ExtraBold,
  });

  if (!fontsLoaded) return <View style={{ flex: 1, backgroundColor: colors.bg }} />;

  return (
    <SafeAreaProvider>
      <StoreProvider>
        <StatusBar style="dark" />
        <DeviceFrame>
          <NavigationContainer theme={navTheme}>
            <TopBar />
            <Tab.Navigator
              screenOptions={{ headerShown: false }}
              tabBar={(props) => <TabBar {...props} />}
            >
              <Tab.Screen name="Home" component={HomeScreen} />
              <Tab.Screen name="Chores" component={ChoresScreen} />
              <Tab.Screen name="Payday" component={PaydayScreen} />
              <Tab.Screen name="Family" component={FamilyScreen} />
            </Tab.Navigator>
          </NavigationContainer>
          <Toast />
        </DeviceFrame>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  // web-only
  backdrop: { flex: 1, backgroundColor: colors.neutral[300], alignItems: 'center', justifyContent: 'center' },
  phone: {
    width: PHONE_W,
    maxWidth: '100%',
    backgroundColor: colors.bg,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
});
