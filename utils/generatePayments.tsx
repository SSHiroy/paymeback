import { BillForm, PayData } from '@/types/types';

export function generatePaymentData(billForm: BillForm): Map<string, PayData> {
    const paymentMap = new Map<string, PayData>();
    
    for (const product of billForm.products) {
        const persons = product.persons ?? [];
        
        for (const person of persons) {
            if (!paymentMap.has(person)) {
                paymentMap.set(person, {
                    personID: person,
                    paymentDetails: '',
                    products: [],
                    total: 0,
                });
            }
            const payData = paymentMap.get(person)!;
            
            payData.products.push(product);
            
            const price = product.price ?? 0;
            const personsCount = persons.length || 1;
            
            payData.total += Math.floor((price / personsCount) * 100) / 100;
            
            if (payData.paymentDetails.length > 0) {
                payData.paymentDetails += ', ';
            }
            payData.paymentDetails += product.toStringSummary ? product.toStringSummary() : product.name ?? 'Item';
        }
    }
    console.log("generatePaymentData Completed:", Array.from(paymentMap.entries()));
    return paymentMap;
}