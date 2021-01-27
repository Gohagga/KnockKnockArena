import { Point, Unit } from "w3ts/index";

export interface IEnumUnitService {

    EnumUnitsInRange(origin: Point, radius: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    /**Angles are all in radians.*/
    EnumUnitsInCone(origin: Point, range: number, angle: number, angleRange: number, filter?: (target: Unit, caster?: Unit) => boolean, source?: Unit): Unit[];

    EnumUnitsInLine(origin: Point, destination: Point, width: number, filter?: (target: Unit, caster: Unit, source?: Unit) => boolean): Unit[];
}