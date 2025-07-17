export type BillForm = {
	storeName: string;
	products: ProductData[];
};

export interface ProductData {
  id: number;
  name: string;
  price: number;
  persons: string[];
  isMine: boolean;
}

export class Product implements ProductData {
	private _id: number;
	private _name: string;
	private _price: number;
	private _persons: string[];
	private _isMine: boolean;
	
	constructor(id: number, name: string, price: number, persons: string[], isMine: boolean) {
		this._id = id;
		this._name = name;
		this._price = price;
		this._persons = persons;
		this._isMine = isMine;
	}
	
	get id(): number {
		return this._id;
	}
	set id(value: number) {
		this._id = value;
	}
	
	get name(): string {
		return this._name;
	}
	set name(value: string) {
		this._name = value;
	}
	
	get price(): number {
		return this._price;
	}
	set price(value: number) {
		this._price = value;
	}
	
	get persons(): string[] {
		return [...this._persons];
	}
	
	addPerson(person: string): void {
		if (!this._persons.includes(person)) {
			this._persons.push(person);
		}
	}
	
	removePerson(person: string): void {
		this._persons = this._persons.filter(p => p !== person);
	}
	
	get isMine(): boolean {
		return this._isMine;
	}
	
	set isMine(value: boolean) {
		this._isMine = value;
	}
	
	toStringName(): string {
		return this._name;
	}
	
	toStringSummary(): string {
		return this._persons.length > 1 ? this._name : `${this._name} (shared)`;
	}
	
	toJSON() {
		return {
			id: this._id,
			name: this._name,
			price: this._price,
			persons: this._persons,
			isMine: this._isMine,
		};
	}
}

export type PayData = {
	personID: string,
	paymentDetails: string,
	products: Product[],
	total: number,
}

export type User = {
	name: string,
	phoneNumber: string,
}