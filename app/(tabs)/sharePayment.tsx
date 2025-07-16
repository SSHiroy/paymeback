import { PayData } from '@/types/types';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import { isAvailableAsync, shareAsync } from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Button, FlatList, ScrollView, StyleSheet, Text, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { captureRef } from 'react-native-view-shot';

import { getLastCreatedFile } from '@/utils/filePaths';
import { generatePaymentData } from '@/utils/generatePayments';
import { generatePayNowQR } from '@/utils/qrGenerator';

export default function SharePayment() {
    const [contactInfoMap, setContactInfoMap] = useState<Record<string, { name: string, phone: string }>>({});
    const [paymentData, setPaymentData] = useState<Map<string, PayData>>(new Map());
    const qrRefs = useRef<Record<string, View>>(Object.create(null));
    
    useEffect(() => {
        async function loadPaymentData() {
            try {
                const filePath = await getLastCreatedFile();
                if (!filePath) return;
                
                const fileContent = await FileSystem.readAsStringAsync(filePath);
                const dataMap = generatePaymentData(fileContent);
                setPaymentData(dataMap);
            } catch (err) {
                console.error('Error reading file or generating payment data:', err);
            }
        }
        
        loadPaymentData();
    }, []);
    
    useEffect(() => {
        async function fetchContacts() {
            const { status } = await Contacts.requestPermissionsAsync();
            if (status !== 'granted') return;
            
            const contactMap: Record<string, { name: string; phone: string }> = {};
            
            for (const personID of paymentData.keys()) {
                const contact = await Contacts.getContactByIdAsync(personID, [
                    Contacts.Fields.PhoneNumbers,
                    Contacts.Fields.FirstName,
                    Contacts.Fields.LastName,
                ]);
                
                const fullName = [contact?.firstName, contact?.lastName].filter(Boolean).join(' ');
                const rawPhone = contact?.phoneNumbers?.[0]?.number ?? '';
                const fallbackPhone = rawPhone
                                        .replace(/\s+/g, '')
                                        .startsWith('+65') 
                                            ? rawPhone.slice(3) 
                                            : rawPhone
                                            
                contactMap[personID] = {
                    name: fullName || fallbackPhone || '',
                    phone: fallbackPhone,
                };
            }
            
            setContactInfoMap(contactMap);
        }
        
        if (paymentData.size > 0) {
            fetchContacts();
        }
    }, [paymentData]);
    
    const generatePaymentQR = async (personID: string): Promise<string | null> => {
        try {
            const contactInfo = contactInfoMap[personID];
            const phoneNumber = contactInfo?.phone ?? '';
            const total = paymentData.get(personID)?.calculateTotal() ?? 0;
            
            if (total < 1) {
                Alert.alert('Invalid amount', 'Total must be at least 1.');
                return null;
            }
            
            const payDetails = paymentData.get(personID)?.payDetails();
            const qrValue = generatePayNowQR(phoneNumber, total, payDetails, 7);
            
            const ref = qrRefs.current[personID];
            if (!ref) {
                Alert.alert('QR ref not available');
                return null;
            }
            
            const uri = await captureRef(ref, {
                format: 'png',
                quality: 1,
            });
            
            const fileUri = ${FileSystem.cacheDirectory}qr-${Date.now()}.png;
            await FileSystem.copyAsync({ from: uri, to: fileUri });
            
            return fileUri;
        } catch (error) {
            console.error('Failed to generate QR code:', error);
            return null;
        }
    };
    
    const handleShareQR = async (personID: string) => {
        try {
            const fileUrl = await generatePaymentQR(personID);
            if (!fileUrl) {
                Alert.alert('QR generation failed', 'Unable to generate payment QR code.');
                return;
            }
            
            if (!(await isAvailableAsync())) {
                Alert.alert('Sharing not available on this platform');
                return;
            }
            
            await shareAsync(fileUrl);
        } catch (error) {
            console.error('Error sharing:', error);
        }
    };
    
    const renderItem = ({ item }: { item: [string, PayData] }) => {
        const [personID, payData] = item;
        const contactInfo = contactInfoMap[personID];
        const name = contactInfo?.name || personID;
        const phone = contactInfo?.phone || '';
        const total = payData.calculateTotal();
        const details = payData.payDetails();
        const qrValue = generatePayNowQR(phone, total, details, 7);
        
        return (
            <View style={styles.row}>
            {/* Hidden QR view for screenshot */}
            <View style={styles.qrHidden}>
            <View
            collapsable={false}
            ref={(ref) => {
                if (ref) {
                    qrRefs.current[personID] = ref;
                }
            }}
            >
            <QRCode value={qrValue} size={200} />
            </View>
            </View>
            
            <Text style={styles.name}>{name}</Text>
            <Text style={styles.price}>${total.toFixed(2)}</Text>
            <Button title="Share QR" onPress={() => handleShareQR(personID)} />
            </View>
        );
    };
    
    return (
        <ScrollView contentContainerStyle={styles.container}>
        <FlatList
        data={Array.from(paymentData.entries())}
        keyExtractor={([personID]) => personID}
        renderItem={renderItem}
        />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        padding: 20,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 15,
        justifyContent: 'space-between',
    },
    name: {
        flex: 2,
        fontSize: 18,
    },
    price: {
        flex: 1,
        fontSize: 18,
        textAlign: 'right',
        marginRight: 10,
    },
    qrHidden: {
        position: 'absolute',
        top: -9999,
        left: -9999,
    },
});