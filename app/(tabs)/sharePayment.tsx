import { BillForm, PayData, Product, User } from '@/types/types';
import { getLastCreatedFile, readUser } from '@/utils/filePaths';
import { generatePaymentData } from '@/utils/generatePayments';
import { generatePayNowQR } from '@/utils/qrGenerator';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import { cacheDirectory } from 'expo-file-system';
import { shareAsync } from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export default function SharePayment() {
	const [contactInfoMap, setContactInfoMap] = useState<Record<string, { name: string; phone: string }>>({});
	const [paymentData, setPaymentData] = useState<Map<string, PayData>>(new Map());
	const [user, setUser] = useState<User | null>(null);
	const [paymentNote, setPaymentNote] = useState<string>('paymeback QRCode');
	const [selectedPersonID, setSelectedPersonID] = useState<string | null>(null);
	const qrRef = useRef<any>(null);
	
	useEffect(() => {
		async function loadUser() {
			const loadedUser = await readUser();
			if (loadedUser) {
				setUser(loadedUser);
				setPaymentNote(`Paying back ${loadedUser.name || loadedUser.phoneNumber}`.substring(0, 20));
			}
		}
		
		loadUser();
	}, []);
	
	useEffect(() => {
		async function loadPaymentData() {
			try {
				const filePath = await getLastCreatedFile();
				if (!filePath) return;
				
				const fileContent = await FileSystem.readAsStringAsync(filePath);
				const rawData = JSON.parse(fileContent);
				
				const products = rawData.products.map(
					(p: any) => new Product(p.id, p.name, p.price, p.persons, p.isMine)
				);
				
				const billForm: BillForm = {
					storeName: rawData.storeName,
					products,
				};
				
				const dataMap = generatePaymentData(billForm);
				setPaymentData(dataMap);
				console.log('Loaded payment data map:', dataMap);
			} catch (err) {
				console.error('Error reading file or generating payment data:', err);
			}
		}
		loadPaymentData();
	}, []);
	
	useEffect(() => {
		async function fetchContacts() {
			const { status } = await Contacts.requestPermissionsAsync();
			if (status !== 'granted') {
				console.warn('Contacts permission not granted');
				return;
			}
			
			try {
				const entries = await Promise.all(
					Array.from(paymentData.keys()).map(async (personID) => {
						const contact = await Contacts.getContactByIdAsync(personID, [
							Contacts.Fields.PhoneNumbers,
							Contacts.Fields.FirstName,
							Contacts.Fields.LastName,
						]);
						
						const firstName = contact?.firstName ?? '';
						const lastName = contact?.lastName ?? '';
						const fullName = [firstName, lastName].filter(Boolean).join(' ');
						
						const rawPhone = contact?.phoneNumbers?.[0]?.number ?? '';
						const fallbackPhone = rawPhone.replace(/\s+/g, '').replace(/^(\+65)/, '');
						
						return [
							personID,
							{
								name: fullName || fallbackPhone || 'Unknown Contact',
								phone: fallbackPhone,
							},
						] as const;
					})
				);
				
				const contactMap = Object.fromEntries(entries);
				setContactInfoMap(contactMap);
			} catch (error) {
				console.error('Failed to fetch contacts:', error);
			}
		}
		
		if (paymentData.size > 0) {
			fetchContacts();
		}
	}, [paymentData]);
	
	const handleShare = async (personID: string) => {
		setSelectedPersonID(personID);
		const contact = contactInfoMap[personID];
		const payment = paymentData.get(personID);
		
		if (!user || !payment) {
			!user ? console.log("No user loaded") : console.log("No payment data for this person");
			return;
		}
		
		try {
			const qrText = generatePayNowQR(user.phoneNumber, payment.total, paymentNote || "paymeback QR");
			
			if (!qrRef.current) {
				console.log("QR code ref not ready");
				return;
			}
			
			qrRef.current.toDataURL(async (base64Data: string) => {
				const qrFilePath = `${cacheDirectory}${Date.now()}.png`;
				
				// ✅ Write actual QR image base64 data
				await FileSystem.writeAsStringAsync(qrFilePath, base64Data, {
					encoding: FileSystem.EncodingType.Base64,
				});
				
				await shareAsync(qrFilePath);
			});
			
		} catch (err) {
			console.error("Failed to generate or share QR code:", err);
		}
	};
	
	const renderItem = ({ item }: { item: [string, PayData] }) => {
		const [personID, payData] = item;
		const contactInfo = contactInfoMap[personID];
		const name = contactInfo?.name || personID;
		const total = payData.total;
		
		return (
			<View style={styles.row}>
			<Text style={styles.name}>{name}</Text>
			<Text style={styles.price}>${total.toFixed(2)}</Text>
			<Button title="Share QR" onPress={() => handleShare(personID)} />
			</View>
		);
	};
	
	const qrValue =
	selectedPersonID && paymentData.has(selectedPersonID) && user
	? generatePayNowQR(user.phoneNumber, paymentData.get(selectedPersonID)!.total, paymentNote || "paymeback QR")
	: "";
	
	return (
		<View style={styles.container}>
		<TextInput
		style={styles.input}
		placeholder="Enter payment note"
		value={paymentNote}
		onChangeText={(text) => {
			const cleaned = text.replace(/[^a-zA-Z0-9 ]/g, ''); // allow letters, numbers, and space
			setPaymentNote(cleaned);
		}}
		maxLength={20}
		/>
		<FlatList
		data={Array.from(paymentData.entries())}
		keyExtractor={([personID]) => personID}
		renderItem={renderItem}
		ListEmptyComponent={<Text>No payment data available</Text>}
		/>
		<View style={{ position: 'absolute', left: -9999 }}>
		{qrValue ? (
			<View style={{ position: 'absolute', left: -9999 }}>
			<QRCode
			value={qrValue}
			getRef={(c) => (qrRef.current = c)}
			size={200}
			ecl="H"
			/>
			</View>
		) : null}
		</View>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
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
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 5,
		padding: 10,
		marginBottom: 20,
		fontSize: 16,
	},
});