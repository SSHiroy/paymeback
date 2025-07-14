
export type BillForm = {
	storeName: string,
	products: Array<Product>,
}

export type Product = {
	id: number,
	name: string,
	price: number,
	persons: string[], 
	isMine: boolean,
}