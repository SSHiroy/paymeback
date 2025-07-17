import { readUser, saveOrUpdateUser } from '@/utils/filePaths';
import * as Contacts from 'expo-contacts';
import React, { useEffect, useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';

export default function Profile() {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    
    const handleChooseContact = async () => {
        const { status } = await Contacts.requestPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert('Permission Denied', 'We need access to your contacts.');
            return;
        }
        
        const contact = await Contacts.presentContactPickerAsync();
        if (contact) {
            const name = `${contact.firstName || ''} ${contact.lastName || ''}`.trim();
            const phone = contact.phoneNumbers?.[0]?.number || '';
            
            setName(name);
            setPhoneNumber(
                phone.replace(/\+65\s?/, '')     // remove +65 or +65 with space
                     .replace(/[^0-9]/g, '')     // remove non-digits
                     .slice(0, 8), // limit 8 digits
            );
            
            saveUserToFile(name, phoneNumber)
        }
    };
    
    const saveUserToFile = async (name: string, phoneNumber: string) => {
        await saveOrUpdateUser(name, phoneNumber);
    };
    
    useEffect(() => {
        async function loadUser() {
            const user = await readUser();
            if (user) {
                setName(user.name);
                setPhoneNumber(user.phoneNumber);
            }
        }
        loadUser();
    }, []);
    
    return (
        <View style={styles.outer}>
        <View style={styles.spacer} />
        <View style={styles.inner}>
        <Text style={styles.label}>Name</Text>
        <TextInput
        style={styles.input}
        placeholder="Your name"
        placeholderTextColor={'grey'}
        value={name}
        onChangeText={setName}
        />
        
        <Text style={styles.label}>Mobile number</Text>
        <TextInput
        style={styles.input}
        placeholder="Your mobile number"
        placeholderTextColor={'grey'}
        value={phoneNumber}
        onChangeText={(text) => {
            // remove +65 prefix if it exists, then strip non-digits and limit to 8
            const cleaned = text
              .replace(/\+65\s?/, '')     // remove +65 or +65 with space
              .replace(/[^0-9]/g, '')     // remove non-digits
              .slice(0, 8);               // 8 digits limit
            // setPhoneNumber(cleaned);
            if (cleaned.length === 8 && !/^[89]/.test(cleaned)) {
                Alert.alert('Invalid input', 'This phone number is invalid!')
                setPhoneNumber('');
            }
            else {
                setPhoneNumber(cleaned); // clear invalid input
            }
        }}
        keyboardType="number-pad"
        maxLength={8}
        />
        
        <View style={{ marginTop: 20 }}>
        <Button title="Choose Contact" onPress={handleChooseContact} />
        </View>
        
        <View style={{ marginTop: 10 }}>
        <Button title="Save" onPress={() => saveUserToFile(name, phoneNumber)} />
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
        backgroundColor: '#fff',
    },
    spacer: {
        height: 40,
    },
    inner: {
        flex: 0,
    },
    label: {
        fontWeight: 'bold',
        marginTop: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: '#999',
        borderRadius: 4,
        padding: 8,
        marginTop: 5,
    },
    flex: {
        flex: 1,
    },
});