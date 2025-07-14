import ProductItem from '@/app/components/ProductItem';
import { BillForm, Product } from '@/types/types';
import { getLastCreatedFile, updateJson } from '@/utils/filePaths';
import { requestPermissionsAsync } from 'expo-contacts';
import { readAsStringAsync } from 'expo-file-system';
import { useEffect, useState, } from 'react';
import {
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform, StyleSheet, Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import { formatNumber } from 'react-native-currency-input';



export default function BillReview() {
	
	const [storeName, setStoreName] = useState('');
	const [productItems, setProductItems] = useState<Product[]>([]);
	const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
	
	useEffect(() => {
		(async () => {
			const { status } = await requestPermissionsAsync();
			const filePath = await getLastCreatedFile();
			
			if (filePath) {
				try {
					const fileContent = await readAsStringAsync(filePath);
					const parsed: BillForm = JSON.parse(fileContent);
					setStoreName(parsed.storeName);
					setProductItems(parsed.products || []);
				} catch (e) {
					console.error('Failed to parse bill JSON:', e);
				}
			}
		})();
	}, []);
	
	const totalCost = productItems.reduce((sum, item) => sum + item.price, 0);
	
	const deleteItem = (id: number) => {
		Alert.alert(
			`Delete '${productItems.find(item => id === item.id)?.name}'`,
			"Are you sure you want to delete this item?",
			[
				{
					text: "Cancel",
					style: "cancel",
				},
				{
					text: "Delete",
					style: "destructive",
					onPress: () => {
						setProductItems((prev) => prev.filter((item) => item.id !== id));
					}
				},
			]
		);
		saveState();
	};
	
	const handleSave = (updatedProduct: Product) => {
		setProductItems((prev) =>
			prev.map((item) =>
				item.id === updatedProduct.id ? updatedProduct : item
	))
	saveState();
};

const handleContactsChange = (updatedProduct: Product) => {
	setProductItems((prev) =>
		prev.map((item) =>
			item.id === updatedProduct.id ? updatedProduct : item));
	saveState();
};


const addNewItem = () => {
	const newId = Date.now();
	setProductItems((prev) => [
		...prev,
		{ id: newId, name: 'New Item', price: 0.01, persons: [], isMine: false },
	]);
	saveState();
};

const saveState = () => {
	updateJson({storeName: storeName, products: productItems});
}

const updateProduct = (updatedProduct: Product) => {
	setProductItems(prev =>
		prev.map(item => (item.id === updatedProduct.id ? updatedProduct : item))
	);
	saveState();
};

const OutsideTouchableWrapper = ({ children }: { children: React.ReactNode }) =>
	expandedItemId ? (
	<TouchableWithoutFeedback onPress={() => setExpandedItemId(null)}>
	<View style={{ flex: 1 }}>{children}</View>
	</TouchableWithoutFeedback>
) : (
	<View style={{ flex: 1 }}>{children}</View>
);

return (
	<OutsideTouchableWrapper>
	<View style={{ flex: 1 }}>
	<View style={{ padding: 12 }}>
	<TextInput
	style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}
	value={storeName}
	onChangeText={setStoreName}
	placeholder="Store Name"
	/>
	</View>
	
	<KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
	<View style={{ flex: 1, padding: 16 }}>
	<FlatList
	data={productItems}
	keyExtractor={(item) => item.id.toString()}
	renderItem={({ item }) => (
		<ProductItem
		{...item}
		isExpanded={expandedItemId === item.id}
		onToggleExpand={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
		onDelete={deleteItem}
		onSave={handleSave}
		/>
	)}
	ListFooterComponent={() => (
		<View style={{
			paddingVertical: 12,
			borderTopWidth: 1,
			borderColor: '#ccc',
			marginTop: 8,
			alignItems: 'flex-end'
		}}>
		<Text style={{ fontWeight: 'bold', fontSize: 18 }}>
		Total: ${formatNumber(totalCost, { separator: '.', precision: 2 })}
		</Text>
		</View>
	)}
	/>
	
	{/* Floating + Button ABOVE footer */}
	<TouchableOpacity onPress={addNewItem} style={styles.floatingButton}>
	<Text style={{ fontSize: 24, color: '#fff' }}>+</Text>
	</TouchableOpacity>
	</View>
	</KeyboardAvoidingView>
	</View>
	</OutsideTouchableWrapper>
	
);
}

const styles = StyleSheet.create({
	floatingButton: {
		backgroundColor: '#2196F3',
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center',
	},
})