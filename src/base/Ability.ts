import { AbilityData } from "config/AbilityData";

export class Ability implements AbilityData {
    
    id: number;
    codeId: string;
    extCodeId?: string | undefined;
    name: string;
    
    
    constructor(
        data: AbilityData
    ) {
        this.id = FourCC(data.codeId);
        this.codeId = data.codeId;
        this.name = data.name;
    }
}