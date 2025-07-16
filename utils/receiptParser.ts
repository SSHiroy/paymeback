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

export async function parseThis(uri: string): Promise<BillForm | Error> {
	try {
		const result = await MlkitOcr.detectFromUri(uri);
		
		const priceRegex = /^.\d+[.]\d{2}$/;
		const descriptionRegex = /^.*[a-zA-Z]{3,}.*$/;
		
		const allElements = result.flatMap(page => page.lines.flatMap(line => line.elements));
		const potentialPrices = allElements.filter(el => priceRegex.test(el.text) && el.bounding?.top !== undefined);
		
		const products: Product[] = [];
		
		for (let i = 0; i < potentialPrices.length; i++) {
			const priceElement = potentialPrices[i];
			const targetTop = priceElement.bounding.top;
			
			const excludeKeywords = ['gst', 'bill', 'total', 'card', 'credit', 'debit', 'rcpt', 'tax', 'cash', 'change', 'thank', 'closed'];
			
			// Get the closest description line to the price's vertical position
			const candidateLines = result.flatMap(page => page.lines).filter(line => descriptionRegex.test(line.text));
			
			if (candidateLines.length === 0) continue;
			
			const closestLine = candidateLines.reduce((prev, curr) =>
				Math.abs(curr.bounding.top - targetTop) < Math.abs(prev.bounding.top - targetTop)
			? curr
			: prev
		);
		
		let description = closestLine?.text?.replace(/(\r\n|\n|\r|\d)/g, '').trim() ?? '';
		
		if (
			!description ||
			excludeKeywords.some(word => description.toLowerCase().includes(word))
		) {
			continue;
		}
		
		const price = Number(priceElement.text.replace(/[^0-9.]/g, ''));
		if (isNaN(price)) continue;
		
		const product = new Product(Date.now() + i, description, price, [], false);
		products.push(product);
	}
	
	// Get topmost line for store name
	const allLines = result.flatMap(page => page.lines);
	const topLine = allLines.length > 0
	? allLines.reduce((a, b) => (a.bounding.top < b.bounding.top ? a : b))
	: { text: 'Store Name' };
	
	const storeName = topLine.text?.replace(/(\r\n|\n|\r)/g, ' ').trim() || 'Store Name';
	
	const billForm: BillForm = {
		storeName,
		products,
	};
	
	await createJson(billForm);
	await logAllFiles();
	
	return billForm;
} catch (error) {
	console.error('Error in parseThis:', error);
	return error as Error;
}
}