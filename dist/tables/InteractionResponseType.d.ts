import { InteractionResponseType } from "..";
export default class InteractionResponseTable {
    static to(type: InteractionResponseType): number;
    static from(type: number): InteractionResponseType;
}
