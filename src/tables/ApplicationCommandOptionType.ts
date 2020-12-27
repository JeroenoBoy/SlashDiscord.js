import { ApplicationCommandOptionType } from "..";

const table = new Map<number, string>();
table.set(1, 'SUB_COMMAND');
table.set(2, 'SUB_COMMAND_GROUP');
table.set(3, 'STRING');
table.set(4, 'INTEGER');
table.set(5, 'BOOLEAN');
table.set(6, 'USER');
table.set(7, 'CHANNEL');
table.set(8, 'ROLE');


const reverseTable = new Map<string, number>();
for(const [ key, value ] of table)
	reverseTable.set(value, key);


export default class ApplicationCommandOptionTable {

	static to(type: ApplicationCommandOptionType): number {
		return reverseTable.get(type)!;
	} 

	static from(type: number): ApplicationCommandOptionType {
		// @ts-ignore
		return table.get(type)!;
	}


}