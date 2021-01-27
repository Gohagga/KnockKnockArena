import { Unit } from "w3ts/index";

export interface IMissile {

    id: number;
    Update?: () => void;
    Destroy?: () => void;
    alive: boolean;

    x: number,
    y: number,
    target?: Unit;
}