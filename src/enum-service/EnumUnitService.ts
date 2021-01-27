import { Log } from "log/Log";
import { Point, Unit } from "w3ts/index";
import { IEnumUnitService } from "./IEnumUnitService";

export class EnumUnitService implements IEnumUnitService {

    group: group = CreateGroup();
    
    EnumUnitsInRange(origin: Point, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[] {
        GroupEnumUnitsInRange(this.group, origin.x, origin.y, radius, null);
        const units: Unit[] = [];
        let u: unit;
        while ((u = FirstOfGroup(this.group)) != null) {
            GroupRemoveUnit(this.group, u);
            let U = Unit.fromHandle(u);
            if (!filter || filter(U, source)) {
                units.push(U);
            }
        }
        return units;
    }

    EnumUnitsInCone(origin: Point, range: number, targetAngle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[] {
        
        const { x, y } = origin;
        const targets = this.EnumUnitsInRange(origin, range, filter, source);
        Log.info("Found", targets.length, "viable targets");

        // type SortData = { index: number, angle: number, angleToTarget: number };
        // let sorted: SortData[] = [];
        let units: Unit[] = [];
        Log.info("Angle range", targetAngle * bj_RADTODEG);

        for (let i = 0; i < targets.length; i++) {
            let unit = targets[i];
            let angle = math.atan(y - unit.y, x - unit.x) + math.pi;
            let angleNormalized = (angle + (math.pi - targetAngle)) % (math.pi*2);
            let min = math.abs(angleNormalized - math.pi);// math.pi - math.abs(math.abs(angle - angleTarget) - math.pi);
            if (min <= angleRange) {
                units.push(unit);
                // sorted.push({
                //     index: i,
                //     angle: angleNormalized,
                //     angleToTarget: min
                // });
            }
        }
        return units;
    }

    EnumUnitsInLine(origin: Point, destination: Point, width: number, filter?: (target: Unit, caster: Unit) => boolean): Unit[] {
        return [];
    }
}