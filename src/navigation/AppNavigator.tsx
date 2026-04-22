import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { ClassManagementScreen } from '../screens/ClassManagementScreen';
import { InstructorTrainingsScreen } from '../screens/InstructorTrainingsScreen';
import { AssignInstructorScreen } from '../screens/AssignInstructorScreen';
import { InstructorLoginScreen } from '../screens/InstructorLoginScreen';
import { StudentRegistrationScreen } from '../screens/StudentRegistrationScreen';
import { StudentMaterialsScreen } from '../screens/StudentMaterialsScreen';
import { ClassFormScreen } from '../screens/ClassFormScreen';
import { getUserSession } from '../storage/authStorage';

export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  ClassManagement: undefined;
  ClassForm: undefined;
  InstructorTrainings: undefined;
  AssignInstructor: {
    classId: string;
  };
  InstructorLogin: {
    classId: string;
  };
  StudentRegistration: {
    classId: string;
  };
  StudentMaterials: {
    classId: string;
    studentRegistrationId: string;
  };
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
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          gestureEnabled: false,
        }}
      >
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="ClassManagement" component={ClassManagementScreen} />
        <Stack.Screen name="ClassForm" component={ClassFormScreen} />
        <Stack.Screen name="InstructorTrainings" component={InstructorTrainingsScreen} />
        <Stack.Screen name="AssignInstructor" component={AssignInstructorScreen} />
        <Stack.Screen name="InstructorLogin" component={InstructorLoginScreen} />
        <Stack.Screen name="StudentRegistration" component={StudentRegistrationScreen} />
        <Stack.Screen name="StudentMaterials" component={StudentMaterialsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}