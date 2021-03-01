import { ApplicationCommandType } from "..";
export default class ApplicationCommandOptionTable {
    static to(type: ApplicationCommandType): number;
    static from(type: number): ApplicationCommandType;
}
