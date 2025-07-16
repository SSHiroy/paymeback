import { Product } from "@/types/types";
import { presentContactPickerAsync } from "expo-contacts";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import CurrencyInput, { formatNumber } from "react-native-currency-input";

export type ProductItemProps = {
	product: Product;
	isExpanded: boolean;
	onToggleExpand: () => void;
	onDelete: (id: number) => void;
	onSave: (updatedProduct: Product) => void;
};

type PersonContact = {
	id: string;
	photo: string;
	name: string;
	number: string;
};

export default function ProductItem(props: ProductItemProps) {
	const { product } = props;

	const [itemName, setItemName] = useState(product.name);
	useEffect(() => {
		setItemName(product.name);
	}, [product.name]);

	const [itemPrice, setItemPrice] = useState(product.price);
	useEffect(() => {
		setItemPrice(product.price);
	}, [product.price]);

	const [productPersons, setProductPersons] = useState<PersonContact[]>([]);

	useEffect(() => {
		const loadContactsFromIds = async () => {
			if (!product.persons.length) return;

			const loadedContacts: PersonContact[] = [];

			for (const contactId of product.persons) {
				try {
					const Contacts = await import("expo-contacts");
					const contact = await Contacts.getContactByIdAsync(contactId);
					if (contact) {
						loadedContacts.push({
							id: contact.id ?? "",
							name: contact.name ?? "Unknown",
							number: contact.phoneNumbers?.[0]?.number ?? "Unknown",
							photo: contact.image?.uri ?? "",
						});
					}
				} catch (err) {
					console.warn(`Failed to load contact ${contactId}:`, err);
				}
			}

			setProductPersons(loadedContacts);
		};

		loadContactsFromIds();
	}, [product.persons]);

	const pickContact = async () => {
		const result = await presentContactPickerAsync();

		if (result?.id && !productPersons.some(c => c.id === result.id)) {
			const newContact: PersonContact = {
				id: result.id,
				photo: result.image?.uri || "",
				name: result.name ?? "Unknown",
				number: result.phoneNumbers?.[0]?.number ?? "Unknown",
			};

			const updatedProduct = new Product(
				product.id,
				itemName,
				itemPrice,
				[...product.persons],
				product.isMine
			);
			updatedProduct.addPerson(result.id);
			props.onSave(updatedProduct);
			setProductPersons(prev => [...prev, newContact]);
		}
	};

	const removeContact = (id: string) => {
		const updatedProduct = new Product(
			product.id,
			itemName,
			itemPrice,
			[...product.persons],
			product.isMine
		);
		updatedProduct.removePerson(id);
		props.onSave(updatedProduct);

		setProductPersons(prev => prev.filter(c => c.id !== id));
	};

	const toProduct = (override?: Partial<{ isMine: boolean }>): Product => {
		const updated = new Product(
			product.id,
			itemName,
			itemPrice,
			[...product.persons],
			override?.isMine ?? product.isMine
		);

		productPersons.forEach(p => {
			if (!updated.persons.includes(p.id)) {
				updated.addPerson(p.id);
			}
		});

		return updated;
	};

	return (
		<View style={{ marginBottom: 16 }}>
			{/* Header */}
			<View style={styles.itemHeader}>
				{/* Delete button */}
				<TouchableOpacity onPress={() => props.onDelete(product.id)} style={styles.deleteButton}>
					<Text style={{ fontSize: 24, color: "red" }}>×</Text>
				</TouchableOpacity>

				{/* Main content */}
				<TouchableOpacity onPress={props.onToggleExpand} style={styles.itemMainContent}>
					<View style={{ paddingLeft: 12 }}>
						<Text style={{ fontWeight: "bold", fontSize: 16 }}>{itemName}</Text>
						<Text>${formatNumber(itemPrice, { separator: ".", precision: 2, delimiter: "," })}</Text>
					</View>

					{/* Contact avatars */}
					<View style={styles.contactContainer}>
						{productPersons.slice(0, 2).map(contact => (
							<View key={contact.id} style={styles.contactItem}>
								{contact.photo ? (
									<Image source={{ uri: contact.photo }} style={{ width: 26, height: 26, borderRadius: 13 }} />
								) : (
									<Text>{contact.name?.[0] || "?"}</Text>
								)}
							</View>
						))}

						{productPersons.length > 2 && (
							<View style={styles.contactItem}>
								<Text>...</Text>
							</View>
						)}

						{/* Add Contact */}
						<TouchableOpacity onPress={pickContact} style={styles.addContactButton}>
							<Text style={{ color: "#fff", fontWeight: "bold" }}>+</Text>
						</TouchableOpacity>

						{/* isMine Toggle Button */}
						<TouchableOpacity
							onPress={() => {
								const updated = toProduct({ isMine: !product.isMine });
								props.onSave(updated);
							}}
							style={{
								marginLeft: 18,
								paddingHorizontal: 8,
								paddingVertical: 4,
								borderRadius: 4,
								backgroundColor: product.isMine ? "#4caf50" : "#ccc",
								justifyContent: "center",
								alignItems: "center",
							}}
							accessibilityLabel={product.isMine ? "Marked as mine" : "Mark as mine"}
						>
							<Text style={{ color: product.isMine ? "white" : "#555", fontWeight: "bold" }}>✓</Text>
						</TouchableOpacity>
					</View>
				</TouchableOpacity>
			</View>

			{/* Expanded content */}
			{props.isExpanded && (
				<View style={styles.expandedContent}>
					<TextInput value={itemName} onChangeText={setItemName} placeholder="Item Name" style={styles.input} />
					<CurrencyInput
						value={itemPrice}
						precision={2}
						delimiter=","
						separator="."
						onChangeValue={val => setItemPrice(val ?? 0.01)}
						style={styles.input}
					/>

					{/* Contact list */}
					{productPersons.map(contact => (
						<View key={contact.id} style={styles.contactRow}>
							<View style={{ flex: 1 }}>
								<Text style={styles.contactName}>{contact.name}</Text>
								<Text style={styles.contactNumber}>{contact.number}</Text>
							</View>
							<TouchableOpacity onPress={() => removeContact(contact.id)} style={styles.removeContactButton}>
								<Text style={styles.removeContactButtonText}>×</Text>
							</TouchableOpacity>
						</View>
					))}

					{/* Action buttons */}
					<View style={styles.actionButtons}>
						<TouchableOpacity onPress={props.onToggleExpand} style={styles.cancelButton}>
							<Text>Cancel</Text>
						</TouchableOpacity>
						<TouchableOpacity
							onPress={() => {
								props.onSave(toProduct());
								props.onToggleExpand();
							}}
							style={styles.saveButton}
						>
							<Text style={{ color: "#fff" }}>Save</Text>
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
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 18,
		backgroundColor: "#ffdddd",
	},
	actionButtons: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginTop: 12,
	},
	cancelButton: {
		padding: 8,
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 4,
		marginRight: 10,
	},
	saveButton: {
		padding: 8,
		backgroundColor: "#28a745",
		borderRadius: 4,
	},
	itemMainContent: {
		flex: 1,
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
	},
	contactContainer: {
		flexDirection: "row",
		alignItems: "center",
	},
	contactItem: {
		width: 26,
		height: 26,
		borderRadius: 13,
		backgroundColor: "#ccc",
		justifyContent: "center",
		alignItems: "center",
		marginRight: 4,
	},
	addContactButton: {
		backgroundColor: "#007AFF",
		paddingHorizontal: 10,
		paddingVertical: 6,
		borderRadius: 4,
	},
	expandedContent: {
		backgroundColor: "#fff",
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		padding: 12,
		marginTop: 8,
	},
	input: {
		borderWidth: 1,
		borderColor: "#ccc",
		padding: 8,
		marginBottom: 10,
		borderRadius: 4,
	},
	itemHeader: {
		borderWidth: 1,
		borderColor: "#ccc",
		borderRadius: 8,
		paddingVertical: 12,
		paddingHorizontal: 12,
		backgroundColor: "#f9f9f9",
		flexDirection: "row",
		alignItems: "center",
	},
	contactRow: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
		paddingVertical: 6,
		paddingHorizontal: 8,
		backgroundColor: "#f0f0f0",
		borderRadius: 6,
	},
	contactName: {
		fontWeight: "600",
		fontSize: 16,
		color: "#222",
	},
	contactNumber: {
		fontSize: 12,
		color: "#555",
		marginTop: 2,
	},
	removeContactButton: {
		padding: 6,
		marginLeft: 12,
		backgroundColor: "#e74c3c",
		borderRadius: 12,
		width: 24,
		height: 24,
		justifyContent: "center",
		alignItems: "center",
	},
	removeContactButtonText: {
		color: "#fff",
		fontWeight: "bold",
		fontSize: 16,
		lineHeight: 16,
	},
});