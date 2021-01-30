import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
import { Point, Timer } from "w3ts/index";

export class Dash extends Ability {

    static readonly knockForce: number = 1800;

    constructor(
        data: AbilityData,
        abilityEvent: IAbilityEventHandler,
        private enumService: IEnumUnitService,
        private missileManager: MissileManager,
        private knockbackManager: KnockbackManager
    ) {
        super(data);
        abilityEvent.OnAbilityCast(this.id, e => this.Execute(e));
    }

    Execute(e: AbilityEvent) {

        const caster = e.caster;
        const owner = caster.owner;

        let { x, y } = caster;
        let targetPoint = e.targetPoint;
        let angle = math.atan(targetPoint.y - y, targetPoint.x - x);

        this.knockbackManager.ApplyKnockback(caster, caster, Dash.knockForce, angle);
        this.knockbackManager.SetWeight(caster, 0.9);
        new Timer().start(3.0, false, () => this.knockbackManager.SetWeight(caster));
    }
}