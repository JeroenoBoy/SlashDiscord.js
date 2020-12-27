import { InteractionResponseType } from "..";

const table = new Map<number, string>();
table.set(1, 'Pong');
table.set(2, 'Acknowledge');
table.set(3, 'ChannelMessage');
table.set(4, 'ChannelMessageWithSource');
table.set(5, 'AcknowledgeWithSource');

const reverseTable = new Map<string, number>();
for(const [ key, value ] of table)
	reverseTable.set(value, key);


export default class InteractionResponseTable {

	static to(type: InteractionResponseType): number {
		return reverseTable.get(type)!;
	} 

	static from(type: number): InteractionResponseType {
		// @ts-ignore
		return table.get(type)!;
	}


}