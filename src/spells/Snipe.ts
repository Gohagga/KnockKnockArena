import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
import { SnipeMissile } from "missiles/SnipeMissile";
import { Point } from "w3ts/index";

export class Snipe extends Ability {

    static readonly speed: number = 800;
    static readonly travelDistance: number = 1600;
    static readonly knockForce: number = 1000;

    constructor(
        data: AbilityData,
        abilityEvent: IAbilityEventHandler,
        private enumService: IEnumUnitService,
        private missileManager: MissileManager,
        private knockbackManager: KnockbackManager
    ) {
        super(data);
        abilityEvent.OnAbilityEffect(this.id, e => this.Execute(e));
    }

    Execute(e: AbilityEvent) {

        Log.info("AAAAaaaaa");
        
        const caster = e.caster;
        const owner = caster.owner;

        Log.info(1)

        let { x, y } = caster;
        let targetPoint = e.targetPoint;
        let angle = math.atan(targetPoint.y - y, targetPoint.x - x);
        
        Log.info(2, angle)

        const missile = new SnipeMissile(x, y, Snipe.speed, Snipe.travelDistance, angle)
            .OnUpdate((m) => {

                const targets = this.enumService.EnumUnitsInRange(new Point(m.x, m.y), 60, target =>
                    (m.travelled < 100 && target == caster) == false &&
                    target.isAlive());
                    
                if (targets.length > 0) {
                    missile.target = targets[0];
                    missile.alive = false;
                }
            })
            .OnDestroy((miss) => {
                if (miss.target) {
                    // this.damageService.UnitDamageTarget(caster, miss.target, data.Damage, this.type, DamageType.Fire);
                    // new Effect(ModelPath.RainOfFire, miss.x, miss.y).destroy();

                    let progress = miss.progress - 1;
                    let knockForce = (1 + progress*progress*progress) * Snipe.knockForce + Snipe.knockForce;
                    // knockForce = Snipe.knockForce;

                    Log.info("Hit target", miss.target.name);
                    let tx = miss.target.x;
                    let ty = miss.target.y;
                    let direction = math.atan(ty - miss.y, tx - miss.x);
                    this.knockbackManager.ApplyKnockback(caster, miss.target, knockForce, direction);
                }
            });

        Log.info(3)

        this.missileManager.Fire(missile);
        
        Log.info(4)
    }
}