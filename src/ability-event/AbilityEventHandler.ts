import { AbilityEvent, AbilityFinishEvent } from "./AbilityEvent";
import { AbilityEventType } from "./AbilityEventType";
import { IAbilityEventHandler } from "./IAbilityEventHandler";
import { RecordEventHandler } from "./RecordEventHandler";

export class AbilityEventHandler implements IAbilityEventHandler {

    private readonly handles: Record<AbilityEventType, RecordEventHandler<(e: any) => void>> = {
        [AbilityEventType.Cast]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Effect]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.End]: new RecordEventHandler<(e: AbilityEvent) => void>(),
        [AbilityEventType.Finished]: new RecordEventHandler<(e: AbilityFinishEvent) => void>(),
        [AbilityEventType.Order]: new RecordEventHandler<(e: AbilityEvent) => void>()
    }

    private Subscribe(type: AbilityEventType, abilityId: number, callback: (e: AbilityEvent) => void) {
        this.handles[type].Subscribe(abilityId, callback);
    }

    public OnAbilityCast(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.Cast, abilityId, callback);
    }

    public OnAbilityEffect(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.Effect, abilityId, callback);
    }

    public OnAbilityEnd(abilityId: number, callback: (e: AbilityEvent) => void) {
        this.Subscribe(AbilityEventType.End, abilityId, callback);
    }

    public OnAbilityFinished(abilityId: number, callback: (e: AbilityFinishEvent) => void) {
        this.Subscribe(AbilityEventType.Finished, abilityId, callback);
    }

    public Register(type: AbilityEventType, abilityId: number) {
        let event: any;
        if (type == AbilityEventType.Finished) event = new AbilityFinishEvent();
        else event = new AbilityEvent();

        if (abilityId in this.handles[type].Subscriptions) {
            this.handles[type].Subscriptions[abilityId](event);
        }
    }
}
