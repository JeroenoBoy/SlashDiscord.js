import { Interaction, InteractionMessageType } from ".";
export declare class InteractionMessage {
    id: string;
    interaction: Interaction;
    constructor(interaction: Interaction, id?: string);
    edit(...messages: InteractionMessageType[]): Promise<void>;
    delete(): Promise<void>;
}
