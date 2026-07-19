import React from 'react';
import { StyleSheet, View } from 'react-native';
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

import { colors } from './theme';
import { StoreProvider } from './store/store';
import { TopBar } from './components/TopBar';
import { TabBar } from './components/TabBar';
import { Toast } from './components/Toast';
import { HomeScreen } from './screens/HomeScreen';
import { ChoresScreen } from './screens/ChoresScreen';
import { PaydayScreen } from './screens/PaydayScreen';
import { FamilyScreen } from './screens/FamilyScreen';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.bg, card: colors.bg, border: colors.divider },
};

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
        <View style={styles.root}>
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
        </View>
      </StoreProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
});
