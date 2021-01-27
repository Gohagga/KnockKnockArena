import { MapPlayer, Unit } from "w3ts/index";

export class DummyService {

    constructor(
        private owner: MapPlayer,
        private unitId: number,
    ) {
        
    }

    GetDummy(ability: number, level: number) {
        let dummy = new Unit(this.owner, this.unitId, 0, 0, 0, 0);
        dummy.addAbility(ability);
        dummy.setAbilityLevel(ability, level);
        dummy.removeGuardPosition();
        dummy.applyTimedLife(FourCC('B000'), 0.5);
        return dummy;
    }
}