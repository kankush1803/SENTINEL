import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001');

export default function App() {
  const triggerSOS = () => {
    socket.emit('sos-trigger', {
      location: 'Hotel Lobby',
      userId: 'guest-123'
    });
    alert('SOS Sent! Emergency responders are on their way.');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Rapid Crisis Response</Text>
      <TouchableOpacity style={styles.sosButton} onPress={triggerSOS}>
        <Text style={styles.sosText}>SOS</Text>
      </TouchableOpacity>
      <Text style={styles.info}>Tap for immediate assistance</Text>
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 50,
  },
  sosButton: {
    backgroundColor: 'red',
    width: 200,
    height: 200,
    borderRadius: 100,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
  sosText: {
    color: 'white',
    fontSize: 48,
    fontWeight: 'bold',
  },
  info: {
    marginTop: 20,
    color: '#666',
  }
});
