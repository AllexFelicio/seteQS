import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { InstructorAgendaScreen } from '../screens/InstructorAgendaScreen';
import { InstructorTrainingsScreen } from '../screens/InstructorTrainingsScreen';
import { getUserSession } from '../storage/authStorage';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  InstructorAgenda: undefined;
  InstructorTrainings: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const [initialRoute, setInitialRoute] = React.useState<'Login' | 'Home' | null>(null);

  React.useEffect(() => {
    async function checkSession() {
      try {
        const session = await getUserSession();
        setInitialRoute(session ? 'Home' : 'Login');
      } catch {
        setInitialRoute('Login');
      }
    }

    checkSession();
  }, []);

  if (!initialRoute) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#F4F7FA',
        }}
      >
        <ActivityIndicator size="large" color="#0F4C81" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="InstructorAgenda" component={InstructorAgendaScreen} />
        <Stack.Screen name="InstructorTrainings" component={InstructorTrainingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}