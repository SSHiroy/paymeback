import { Product } from "@/types/types";
import { presentContactPickerAsync } from "expo-contacts";
import { useEffect, useRef, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CurrencyInput, { formatNumber } from "react-native-currency-input";

export type ProductItemProps = Product & {
	isExpanded: boolean;
	onToggleExpand: () => void;
	onDelete: (id: number) => void;
	onSave: (updatedProduct: Product) => void;
	// onToggleMine: (id: number) => void;
};

export default function ProductItem(props: ProductItemProps) {
	const [itemName, setItemName] = useState(props.name);
	useEffect(() => {
		setItemName(props.name);
	}, [props.name]);

	const [itemPrice, setItemPrice] = useState(props.price);
	useEffect(() => {
		setItemPrice(props.price);
	}, [props.price]);

	type PersonContact = {
		id: string,
		photo: string,
		name: string,
		number: string,
	}
	
	const [productPersons, setProductPersons] = useState<PersonContact[]>([]);
	
	const saveTimeoutRef = useRef<number | null>(null);
	
	useEffect(() => {
		const loadContactsFromIds = async () => {
			if (!props.persons?.length) return;
			
			const loadedContacts: PersonContact[] = [];
			
			for (const contactId of props.persons) {
				try {
					const Contacts = await import('expo-contacts');
					const contact = await Contacts.getContactByIdAsync(contactId);
					if (contact) {
						loadedContacts.push({
							id: contact.id ?? '',
							name: contact.name ?? 'Unknown',
							number: contact.phoneNumbers?.[0]?.number ?? 'Unknown',
							photo: contact.image?.uri ?? '',
						});
					}
				} catch (err) {
					console.warn(`Failed to load contact ${contactId}:`, err);
				}
			}
			
			setProductPersons(loadedContacts);
		};
		
		loadContactsFromIds();
	}, [props.persons]);
	
	const pickContact = async () => {
		const result = await presentContactPickerAsync();
		if (result?.id && !productPersons.some(c => c.id === result.id)) {
			const addContact: PersonContact = {
				id: result.id,
				photo: result.image?.uri || '',
				name: result.name ?? 'Unknown',
				number: result.phoneNumbers?.[0]?.number ?? 'Unknown'
			};
			setProductPersons(prev => {
				const updated = [...prev, addContact];
				props.onSave({
					...toProduct(),
					persons: updated.map(p => p.id),
				});
				return updated;
			});
		}
	};
	
	const removeContact = (id: string) => {
		setProductPersons(prev => {
			const updated = prev.filter(cid => cid.id !== id);
			props.onSave({
				...toProduct(),
				persons: updated.map(p => p.id),
			});
			return updated;
		});
	};
	
	const toProduct = (): Product => {
		return {
			id: props.id,
			name: itemName,
			price: itemPrice,
			persons: productPersons.map(p => p.id),
			isMine: props.isMine,
		};
	};
	
	return (
		<View style={{ marginBottom: 16 }}>
		{/* Header */}
		<View style={styles.itemHeader}>
		{/* Delete button */}
		<TouchableOpacity onPress={() => props.onDelete(props.id)} style={styles.deleteButton}>
		<Text style={{ fontSize: 24, color: 'red' }}>×</Text>
		</TouchableOpacity>
		{/* Main content */}
		<TouchableOpacity onPress={props.onToggleExpand} style={styles.itemMainContent}>
		<View style={{ paddingLeft: 12 }}>
		<Text style={{ fontWeight: 'bold', fontSize: 16 }}>{itemName}</Text>
		<Text style={{}}>${formatNumber(itemPrice, { separator: '.', precision: 2, delimiter: ','})}</Text>
		</View>
		{/* Contact Picker */}
		<View style={styles.contactContainer}>
		{productPersons.slice(0, 2).map((contact) => (
			<View key={contact.id} style={styles.contactItem}>
			{/* Display image if photo exists, otherwise display first letter of name or '?' */}
			{contact.photo ? (
				<Image source={{ uri: contact.photo }} />
			) : (
				<Text>{contact.name?.[0] || '?'}</Text>
			)}
			</View>
		))}
		
		{productPersons.length > 2 && (
			<View style={styles.contactItem}>
			<Text>...</Text>
			</View>
		)}
		
		<TouchableOpacity onPress={pickContact} style={styles.addContactButton}>
		<Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
		</TouchableOpacity>
		{/* isMine Toggle Button */}
		<TouchableOpacity
		onPress={() => {
			props.onSave({
				...toProduct(),
				isMine: !props.isMine,
			});
		}}
		style={{
			marginLeft: 18,
			paddingHorizontal: 8,
			paddingVertical: 4,
			borderRadius: 4,
			backgroundColor: props.isMine ? '#4caf50' : '#ccc',
			justifyContent: 'center',
			alignItems: 'center',
		}}
		accessibilityLabel={props.isMine ? 'Marked as mine' : 'Mark as mine'}
		>
		<Text style={{ color: props.isMine ? 'white' : '#555', fontWeight: 'bold' }}>
		✓
		</Text>
		</TouchableOpacity>
		</View>
		</TouchableOpacity>
		</View>
		
		{/* Expanded content */}
		{props.isExpanded && (
			<View style={styles.expandedContent}>
			<TextInput value={itemName} onChangeText={setItemName} placeholder="Item Name" style={styles.input} />
			<CurrencyInput value={itemPrice} precision={2} delimiter=',' separator='.' 
			onChangeValue={(val) => {
				if (val === null) {
					setItemPrice(0.01);
				} else {
					setItemPrice(val);
				}
			}} 
			style={styles.input} />
			
			{/* Contact list */}
			{productPersons.map((contact) => (
				<View
				key={contact.id}
				style={{
					flexDirection: 'row',
					alignItems: 'center',
					marginBottom: 8,
					paddingVertical: 6,
					paddingHorizontal: 8,
					backgroundColor: '#f0f0f0',
					borderRadius: 6,
				}}
				>
				<View style={{ flex: 1 }}>
				<Text
				style={{
					fontWeight: '600',
					fontSize: 16,
					color: '#222',
				}}
				>
				{contact.name}
				</Text>
				<Text
				style={{
					fontSize: 12,
					color: '#555',
					marginTop: 2,
				}}
				>
				{contact.number}
				</Text>
				</View>
				<TouchableOpacity
				onPress={() => removeContact(contact.id)}
				style={{
					padding: 6,
					marginLeft: 12,
					backgroundColor: '#e74c3c',
					borderRadius: 12,
					width: 24,
					height: 24,
					justifyContent: 'center',
					alignItems: 'center',
				}}
				>
				<Text
				style={{
					color: '#fff',
					fontWeight: 'bold',
					fontSize: 16,
					lineHeight: 16,
				}}
				>
				×
				</Text>
				</TouchableOpacity>
				</View>
			))}
			{/* Buttons */}
			<View style={styles.actionButtons}>
			<TouchableOpacity onPress={props.onToggleExpand} style={styles.cancelButton}>
			<Text>Cancel</Text>
			</TouchableOpacity>
			<TouchableOpacity onPress={() => {
				props.onSave(toProduct())
				props.onToggleExpand();
			}
		}
		style={styles.saveButton}>
		<Text style={{ color: '#fff' }}>Save</Text>
		</TouchableOpacity>
		</View>
		</View>
	)}
	</View>
);
}

const styles = StyleSheet.create({
	deleteButton: {
		width: 30,
		height: 30,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 18,
		backgroundColor: '#ffdddd',
	},
	actionButtons: {
		flexDirection: 'row',
		justifyContent: 'flex-end',
		marginTop: 12,
	},
	cancelButton: {
		padding: 8,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
		marginRight: 10,
	},
	saveButton: {
		padding: 8,
		backgroundColor: '#28a745',
		borderRadius: 4,
	},
	itemMainContent: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	contactContainer: {
		flexDirection: 'row',
		alignItems: 'center',
	},
	contactItem: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: '#ccc',
		justifyContent: 'center',
		alignItems: 'center',
		marginRight: 4,
	},
	addContactButton: {
		backgroundColor: '#007AFF',
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 4,
	},
	expandedContent: {
		backgroundColor: '#fff',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		padding: 12,
		marginTop: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: '#ccc',
		padding: 8,
		marginBottom: 10,
		borderRadius: 4,
	},
	itemHeader: {
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		paddingVertical: 12,
		paddingLeft: 12,
		paddingRight: 12,
		backgroundColor: '#f9f9f9',
		flexDirection: 'row',
		alignItems: 'center',
	},
})