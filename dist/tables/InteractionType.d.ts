import { InteractionType } from "..";
export default class InteractionTable {
    static to(type: InteractionType): number;
    static from(type: number): InteractionType;
}
