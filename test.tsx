import * as Contacts from 'expo-contacts';
import { useEffect, useState } from 'react';
import {
	Alert,
	FlatList,
	Keyboard,
	KeyboardAvoidingView,
	Platform,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View,
} from 'react-native';
import CurrencyInput from 'react-native-currency-input';

export default function ContactItemList() {
	useEffect(() => {
		(async () => {
			const { status } = await Contacts.requestPermissionsAsync();
			if (status !== 'granted') {
				console.log('Contacts permission not granted');
			}
		})();
	}, []);
	
	const [items, setItems] = useState([
		{ id: '1', name: 'Item 1', cost: '10.00' },
		{ id: '2', name: 'Item 2', cost: '20.00' },
		{ id: '3', name: 'Item 3', cost: '20.00' },
	]);
	
	const [expandedItemId, setExpandedItemId] = useState(null);
	
	const deleteItem = (id) => {
		setItems((prev) => prev.filter((item) => item.id !== id));
		if (expandedItemId === id) {
			setExpandedItemId(null);
		}
	};
	
	// Save updated name and cost from ContactItem
	const saveItem = (id, newName, newCost) => {
		setItems((prev) =>
			prev.map((item) =>
				item.id === id
		? { ...item, name: newName, cost: newCost }
		: item
	)
);
setExpandedItemId(null);
Keyboard.dismiss();
};

// Wrapper for outside taps ONLY if an item is expanded
const OutsideTouchableWrapper = ({ children }) =>
	expandedItemId ? (
	<TouchableWithoutFeedback
	onPress={() => {
		setExpandedItemId(null);
		Keyboard.dismiss();
	}}
	>
	<View style={{ flex: 1 }}>{children}</View>
	</TouchableWithoutFeedback>
) : (
	<View style={{ flex: 1 }}>{children}</View>
);

const totalCost = items.reduce((sum, item) => sum + parseFloat(item.cost || 0), 0);

return (
	<OutsideTouchableWrapper>
		    <View style={{ padding: 12 }}>
      <TextInput style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}>
        My Awesome Title
      </TextInput>
    </View>
	<KeyboardAvoidingView
	style={{ flex: 1 }}
	behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
	>
	<View style={{ flex: 1, padding: 16 }}>
	<FlatList
	data={items}
	keyExtractor={(item) => item.id}
	renderItem={({ item }) => (
		<ContactItem
		id={item.id}
		initialName={item.name}
		initialCost={item.cost}
		onDelete={deleteItem}
		onSave={saveItem}
		isExpanded={expandedItemId === item.id}
		onToggleExpand={() =>
			setExpandedItemId((prev) => (prev === item.id ? null : item.id))
		}
		collapseOthers={() => setExpandedItemId(null)}
		/>
	)}
	keyboardShouldPersistTaps="handled"
	contentContainerStyle={{
		paddingBottom: 120, // space for floating button
	}}
	ListFooterComponent={() => (
		<View
		style={{
			paddingVertical: 12,
			borderTopWidth: 1,
			borderColor: '#ccc',
			marginTop: 8,
			alignItems: 'flex-end',
		}}
		>
		<Text style={{ fontWeight: 'bold', fontSize: 18 }}>
		Total: ${totalCost.toFixed(2)}
		</Text>
		</View>
	)}
	/>
	
	{/* Floating Add Button */}
	<TouchableOpacity
	onPress={() => {
		const newId = Date.now().toString();
		setItems((prev) => [
			...prev,
			{ id: newId, name: 'New Item', cost: '0.01' },
		]);
		setExpandedItemId(newId);
	}}
	style={{
		position: 'absolute',
		bottom: 24,
		right: 24,
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: '#007AFF',
		justifyContent: 'center',
		alignItems: 'center',
		elevation: 5,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.3,
		shadowRadius: 3,
	}}
	
	>
	<Text style={{ fontSize: 32, color: 'white', lineHeight: 32 }}>+</Text>
	</TouchableOpacity>
	</View>
	</KeyboardAvoidingView>
	
	</OutsideTouchableWrapper>
	
);
}

function ContactItem({
	id,
	initialName,
	initialCost,
	onDelete,
	onSave, // new prop for saving edits
	isExpanded,
	onToggleExpand,
	collapseOthers,
}) {
	const [itemName, setItemName] = useState(initialName);
	const [itemCost, setItemCost] = useState(parseFloat(initialCost));
	const [contacts, setContacts] = useState([]);
	
	
	
	const pickContact = async () => {
		const result = await Contacts.presentContactPickerAsync();
		if (result && result.id) {
			const fullContact = await Contacts.getContactByIdAsync(result.id);
			if (fullContact && !contacts.find((c) => c.id === fullContact.id)) {
				setContacts((prev) => [...prev, fullContact]);
			}
		}
	};
	
	const removeContact = (id) => {
		setContacts((prev) => prev.filter((c) => c.id !== id));
	};
	
	const handleDelete = (itemName) => {
		Alert.alert(`Delete '${itemName}'`, 'Are you sure you want to delete this item?', [
			{ text: 'Cancel', style: 'cancel' },
			{
				text: 'Delete',
				style: 'destructive',
				onPress: () => onDelete(id),
			},
		]);
	};
	
	// Limit cost input to valid number with 2 decimals max
	const handleCostChange = (cost) => {
		const costExp = /^\d+(\.\d{1,2})?$/
		if (cost === '' || !costExp.test(cost) ) {
			return;
		} else if (costExp.test(cost)) setItemCost(cost);
	};
	
	const handleSave = () => {
		const costToSave = isNaN(itemCost) ? '0.01' : itemCost.toFixed(2);
		onSave(id, itemName.trim() || 'Unnamed Item', costToSave);
	};
	
	return (
		<View style={{ marginBottom: 16, overflow: 'visible' }}>
		{/* Header Container */}
		<View
		style={{
			borderWidth: 1,
			borderColor: '#ccc',
			borderRadius: 8,
			paddingVertical: 12,
			paddingLeft: 12,
			paddingRight: 12,
			backgroundColor: '#f9f9f9',
			flexDirection: 'row',
			alignItems: 'center',
		}}
		>
		{/* Delete button */}
		<TouchableOpacity
		onPress={() => handleDelete(itemName)}
		style={{
			padding: 8,
			width: 36,
			height: 36,
			justifyContent: 'center',
			alignItems: 'center',
			borderRadius: 18,
			backgroundColor: '#ffdddd',
			elevation: 2,
			shadowColor: '#000',
			shadowOffset: { width: 0, height: 1 },
			shadowOpacity: 1,
			shadowRadius: 0.5,
			marginRight: 12,
		}}
		>
		<Text style={{ fontSize: 24, color: 'red', lineHeight: 24 }}>×</Text>
		</TouchableOpacity>
		
		{/* Main content container */}
		<TouchableOpacity
		activeOpacity={0.9}
		onPress={onToggleExpand}
		style={{
			flex: 1,
			flexDirection: 'row',
			justifyContent: 'space-between',
			alignItems: 'center',
		}}
		>
		<View>
		<Text style={{ fontWeight: 'bold', fontSize: 16 }}>{itemName}</Text>
		<Text>${parseFloat(itemCost || 0.01).toFixed(2)}</Text>
		</View>
		
		<View style={{ flexDirection: 'row', alignItems: 'center' }}>
		{contacts.map((contact) => (
			<View
			key={contact.id}
			style={{
				width: 26,
				height: 26,
				borderRadius: 13,
				backgroundColor: '#ccc',
				justifyContent: 'center',
				alignItems: 'center',
				marginRight: 4,
			}}
			>
			<Text style={{ fontSize: 12 }}>{contact.name?.[0] || '?'}</Text>
			</View>
		))}
		<View style={{ paddingLeft: 7.5 }}>
		<TouchableOpacity
		onPress={pickContact}
		style={{
			backgroundColor: '#007AFF',
			paddingHorizontal: 10,
			paddingVertical: 6,
			borderRadius: 4,
		}}
		>
		<Text style={{ color: '#fff', fontWeight: 'bold' }}>+</Text>
		</TouchableOpacity>
		</View>
		</View>
		</TouchableOpacity>
		
		</View>
		
		{/* Expanded dropdown */}
		{isExpanded && (
			<View
			style={{
				backgroundColor: '#fff',
				borderWidth: 1,
				borderColor: '#ccc',
				borderRadius: 8,
				padding: 12,
				marginTop: 8,
				zIndex: 10,
				shadowColor: '#000',
				shadowOffset: { width: 0, height: 2 },
				shadowOpacity: 0.2,
				shadowRadius: 4,
				elevation: 5,
			}}
			>
			<TextInput
			value={itemName}
			onChangeText={setItemName}
			placeholder="Item Name"
			style={{
				borderWidth: 1,
				borderColor: '#ccc',
				padding: 8,
				marginBottom: 10,
				borderRadius: 4,
			}}
			/>
			
			<CurrencyInput
			value={itemCost}
			onChangeValue={setItemCost}
			minValue={0.01}
			prefix="$"
			separator="."
			precision={2}
			style={{
				borderWidth: 1,
				borderColor: '#ccc',
				padding: 8,
				marginBottom: 10,
				borderRadius: 4,
			}}
			/>
			
			{contacts.map((contact) => (
				<View
				key={contact.id}
				style={{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
					backgroundColor: '#eee',
					padding: 8,
					borderRadius: 4,
					marginBottom: 6,
				}}
				>
				<View>
				<Text>{contact.name}</Text>
				<Text style={{ fontSize: 12, color: '#555' }}>
				{contact.phoneNumbers?.[0]?.number || 'No number'}
				</Text>
				</View>
				<TouchableOpacity onPress={() => removeContact(contact.id)}>
				<Text style={{ color: 'red' }}>Remove</Text>
				</TouchableOpacity>
				</View>
			))}
			
			<View
			style={{
				flexDirection: 'row',
				justifyContent: 'flex-end',
				marginTop: 12,
			}}
			>
			<TouchableOpacity
			onPress={collapseOthers}
			style={{
				padding: 8,
				borderWidth: 1,
				borderColor: '#ccc',
				borderRadius: 4,
				marginRight: 10,
			}}
			>
			<Text>Cancel</Text>
			</TouchableOpacity>
			<TouchableOpacity
			onPress={handleSave}
			style={{
				padding: 8,
				backgroundColor: '#28a745',
				borderRadius: 4,
			}}
			>
			<Text style={{ color: '#fff', fontWeight: 'bold' }}>Save</Text>
			</TouchableOpacity>
			</View>
			</View>
		)}
		
		</View>
		
	);
}