import { AbilityEvent, AbilityFinishEvent } from "./AbilityEvent";
import { AbilityEventType } from "./AbilityEventType";

export interface IAbilityEventHandler {

    OnAbilityCast(abilityId: number, callback: (e: AbilityEvent) => void): void;

    OnAbilityEffect(abilityId: number, callback: (e: AbilityEvent) => void): void;

    OnAbilityEnd(abilityId: number, callback: (e: AbilityEvent) => void): void;

    OnAbilityFinished(abilityId: number, callback: (e: AbilityFinishEvent) => void): void;

    Register(type: AbilityEventType, abilityId: number): void;
}