import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';


export default function Profile() {
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSave = () => {
    Alert.alert('Saved', `Name: ${name}\nPhone number: ${phoneNumber}`);
  };

  return (
    <View style={styles.outer}>
      <View style={styles.spacer} />
      <View style={styles.inner}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Your name"
          value={name}
          onChangeText={setName}
        />

        <Text style={styles.label}>Mobile number</Text>
        <TextInput
          style={styles.input}
          placeholder="Your mobile number"
          value={phoneNumber}
          onChangeText={(text) => {
            // restrict to only numbers and max 8 digits
            const cleaned = text.replace(/[^0-9]/g, '').slice(0, 8);
            setPhoneNumber(cleaned);
          }}
          keyboardType="number-pad"
          maxLength={8}
        />

        <View style={{ marginTop: 20 }}>
          <Button title="Save" onPress={handleSave} />
        </View>
      </View>
      <View style={styles.flex} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    padding: 20,
  },
  spacer: {
    flex: 0.3,
  },
  flex: {
    flex: 1,
  },
  inner: {
    width: '100%',
  },
  label: {
    fontSize: 16,
    marginBottom: 6,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 15,
    borderRadius: 6,
    fontSize: 16,
  },
});
