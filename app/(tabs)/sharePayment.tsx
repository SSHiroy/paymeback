import { BillForm, PayData, Product } from '@/types/types';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import React, { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, View } from 'react-native';

import { getLastCreatedFile } from '@/utils/filePaths';
import { generatePaymentData } from '@/utils/generatePayments';

export default function SharePayment() {
	const [contactInfoMap, setContactInfoMap] = useState<Record<string, { name: string; phone: string }>>({});
	const [paymentData, setPaymentData] = useState<Map<string, PayData>>(new Map());

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

	const handleShareLog = (personID: string) => {
		const contact = contactInfoMap[personID];
		const payment = paymentData.get(personID);
		console.log('Sharing for:', {
			personID,
			name: contact?.name,
			phone: contact?.phone,
			amount: payment?.total,
			details: payment?.paymentDetails,
		});
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
				<Button title="Log Share" onPress={() => handleShareLog(personID)} />
			</View>
		);
	};

	return (
		<View style={styles.container}>
			<FlatList
				data={Array.from(paymentData.entries())}
				keyExtractor={([personID]) => personID}
				renderItem={renderItem}
				ListEmptyComponent={<Text>No payment data available</Text>}
			/>
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
});