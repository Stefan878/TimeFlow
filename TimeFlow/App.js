import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AppNavigator  from './src/navigation/AppNavigator';
import {Provider as PaperProvider} from 'react-native-paper';
import RootNavigator from './src/navigation/RootNavigator';
import { AuthProvider } from './src/context/AuthContext';


export default function App() {
  return (
  <PaperProvider>
    <AuthProvider>
    <NavigationContainer>
      <RootNavigator/>
    </NavigationContainer>
    </AuthProvider>
  </PaperProvider>
  );
}
