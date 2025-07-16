import ProductItem from '@/app/components/ProductItem';
import { BillForm, Product } from '@/types/types';
import { getLastCreatedFile, updateJson } from '@/utils/filePaths';
import * as Contacts from 'expo-contacts';
import * as FileSystem from 'expo-file-system';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
	Alert,
	FlatList,
	KeyboardAvoidingView,
	Platform,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	TouchableWithoutFeedback,
	View
} from 'react-native';
import { formatNumber } from 'react-native-currency-input';

export default function BillReview() {
	const router = useRouter();
	
	const [storeName, setStoreName] = useState('');
	const [productItems, setProductItems] = useState<Product[]>([]);
	const [expandedItemId, setExpandedItemId] = useState<number | null>(null);
	
	const [isInitialLoadComplete, setIsInitialLoadComplete] = useState(false);
	
	useEffect(() => {
		(async () => {
			const { status } = await Contacts.requestPermissionsAsync();
			if (status !== 'granted') {
				console.warn('Contacts permission not granted, skipping load.');
				return;
			}
			
			const filePath = await getLastCreatedFile();
			
			if (filePath) {
				try {
					const fileContent = await FileSystem.readAsStringAsync(filePath);
					const parsed: BillForm = JSON.parse(fileContent);
					console.log('Loaded bill:', parsed);
					setStoreName(parsed.storeName);
					const products = (parsed.products || []).map(createProductFromObject);
					setProductItems(products);
					setIsInitialLoadComplete(true);
					
					
				} catch (e) {
					console.error('Failed to parse bill JSON:', e);
				}
			}
		})();
	}, []);
	
	// Save state to JSON whenever storeName or productItems change
	useEffect(() => {
		if (!isInitialLoadComplete) return;
		
		const save = async () => {
			try {
				await updateJson({
					storeName,
					products: productItems.map(product => product.toJSON()), // no 'as Product[]' cast here
				});
			} catch (e) {
				console.error('Failed to save JSON:', e);
			}
		};
		
		save();
	}, [storeName, productItems]);
	
	const totalCost = productItems.reduce((sum, item) => sum + item.price, 0);
	
	const deleteItem = (id: number) => {
		const productName = productItems.find(item => item.id === id)?.name ?? '';
		Alert.alert(
			`Delete '${productName}'`,
			'Are you sure you want to delete this item?',
			[
				{ text: 'Cancel', style: 'cancel' },
				{
					text: 'Delete',
					style: 'destructive',
					onPress: () => {
						setProductItems((prev) => prev.filter((item) => item.id !== id));
						// No saveState() here; useEffect handles saving
					}
				}
			]
		);
	};
	
	const handleSave = (updatedProduct: Product) => {
		setProductItems((prev) =>
			prev.map((item) =>
				item.id === updatedProduct.id ? updatedProduct : item
	)
);
};

const addNewItem = () => {
	const newId = Date.now();
	const newProduct = new Product(newId, 'New Item', 0.01, [], false);
	setProductItems((prev) => [...prev, newProduct]);
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
	<TouchableOpacity
	onPress={() => router.push('/sharePayment')}
	style={styles.topRightButton}
	>
	<Text style={{ fontSize: 16, color: '#2196F3' }}>Go</Text>
	</TouchableOpacity>
	<TextInput
	style={{ fontSize: 24, fontWeight: 'bold', color: '#333' }}
	value={storeName}
	onChangeText={setStoreName}
	placeholder="Store Name"
	/>
	</View>
	
	<KeyboardAvoidingView
	style={{ flex: 1 }}
	behavior={Platform.OS === 'ios' ? 'padding' : undefined}
	>
	<View style={{ flex: 1, padding: 16 }}>
	<FlatList
	keyboardShouldPersistTaps="handled"
	data={productItems}
	keyExtractor={(item) => item.id.toString()}
	renderItem={({ item }) => (
		<ProductItem
		product={item}
		isExpanded={expandedItemId === item.id}
		onToggleExpand={() =>
			setExpandedItemId(expandedItemId === item.id ? null : item.id)
		}
		onDelete={deleteItem}
		onSave={handleSave}
		/>
	)}
	ListFooterComponent={() => (
		<View
		style={{
			paddingVertical: 12,
			borderTopWidth: 1,
			borderColor: '#ccc',
			marginTop: 8,
			alignItems: 'flex-end'
		}}
		>
		<Text style={{ fontWeight: 'bold', fontSize: 18 }}>
		Total: $
		{formatNumber(totalCost, {
			separator: '.',
			precision: 2
		})}
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

function createProductFromObject(obj: any): Product {
	return new Product(
		obj._id ?? obj.id,
		obj._name ?? obj.name,
		obj._price ?? obj.price,
		obj._persons ?? obj.persons,
		obj._isMine ?? obj.isMine
	);
}

const styles = StyleSheet.create({
	floatingButton: {
		backgroundColor: '#2196F3',
		width: 48,
		height: 48,
		borderRadius: 24,
		justifyContent: 'center',
		alignItems: 'center'
	},
	topRightButton: {
		position: 'absolute',
		top: 16,
		right: 16,
		zIndex: 10,
		padding: 8
	}
});