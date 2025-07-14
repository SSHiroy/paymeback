import { BillForm, Product } from '@/types/types';
import { createJson, logAllFiles } from '@/utils/filePaths';
import MlkitOcr from 'react-native-mlkit-ocr';

/**
* The function works in stepwise:
*  1) Generate the JSON list using `react-native-mlkit-ocr`
*  2) Parse the list of JSON for items
* 
* The actual parsing is done by looking for the top most
* float or decimal value, which will most likely be the price
* of the first item. It then goes leftwise,
* looking for other json objects within ±15px
* of that bounding box on the y-axis. This will first encounter
* a description of that item (the first item to the left of the price)
* and then the quantity (the first item to the left of the item description)
* 
* @param uri The uri path to the image
* 
*/

export async function parseThis(uri: string) {
	try {
		const result = await MlkitOcr.detectFromUri(uri);

		const priceRegex = /^.\d+[.]\d{2}$/;
		const descriptionRegex = /^.*[a-zA-Z]{3,}.*$/;
		
		const potentialPrices = result.flatMap(price => price.lines.flatMap(b => b.elements))
									  .filter(price => priceRegex.test(price.text));
		const products = [];

		for (let i = 0; i < potentialPrices.length; i++) {
			const target = potentialPrices[i].bounding.top;
			const excludeKeywords = ['gst', 'bill', 'total', 'card', 'credit', 'debit', 'rcpt', 'tax', 'cash', 'change', 'thank', 'closed'];
			const description: string = result
											.flatMap(a => a.lines)
											.filter(a => descriptionRegex.test(a.text))
											.reduce((prev, curr) => 
														Math.abs(curr.bounding.top - target) 
														< Math.abs(prev.bounding.top - target)
													? curr : prev)
			
											.text.replace(/(\r\n|\n|\r|\d)/g, '').trim() || "not found";

			if (excludeKeywords.
					some(word => description.toLowerCase().includes(word))) {
				continue;
			}
			
			const product: Product = {
				id: Date.now() + i,
				name: description,
				price: Number(potentialPrices[i].text.replace(/[^0-9.]/g, '')),
				persons: [],
				isMine: false,
			}
			products.push(product);
		}
		
		const billForm: BillForm = {
			storeName: result
						.flatMap(a => a.lines)
						.reduce((a, b) => 
									a.bounding.top 
									< b.bounding.top 
								? a : b)
						.text
						.replace(/(\r\n|\n|\r)/g, ' ') || 'Store Name...',
			products: products,
		}

		await createJson(billForm);
		await logAllFiles();
		return billForm
		
	} catch (error) {
		return error;
	}
}