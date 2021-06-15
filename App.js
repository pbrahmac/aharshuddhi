import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MyCamera from './components/MyCamera';
import MyNewCamera from './components/MyNewCamera';

export default function App() {
  return (
    <View style={styles.container}>
      <MyCamera />
      {/* <MyNewCamera /> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
