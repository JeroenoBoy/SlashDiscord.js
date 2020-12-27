import { InteractionType } from "..";

const table = new Map<number, string>();
table.set(1, 'Ping');
table.set(2, 'ApplicationCommand')


const reverseTable = new Map<string, number>();
for(const [ key, value ] of table)
	reverseTable.set(value, key);


export default class InteractionTable {

	static to(type: InteractionType): number {
		return reverseTable.get(type)!;
	} 

	static from(type: number): InteractionType {
		// @ts-ignore
		return table.get(type)!;
	}


}