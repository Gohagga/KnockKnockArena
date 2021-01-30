import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
import { BlastMissile } from "missiles/BlastMissile";
import { Effect, Point } from "w3ts/index";
import { Trap } from "./Trap";

export class Blast extends Ability {

    static readonly speed: number = 650;
    static readonly travelDistance: number = 1200;
    static readonly knockForce: number = 1200;
    static readonly aoe: number = 160;

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

        const missile = new BlastMissile(x, y, Blast.speed, Blast.travelDistance, angle)
            .OnUpdate((m) => {

                const targets = this.enumService.EnumUnitsInRange(new Point(m.x, m.y), 70, target =>
                    (m.travelled < 100 && target == caster) == false &&
                    target.typeId != Trap.trapUnitId &&
                    target.isAlive());
                    
                if (targets.length > 0) {
                    missile.alive = false;
                }
            })
            .OnDestroy((m) => {

                let sfx = new Effect('war3mapImported\\Force Blast_03.mdx', m.x, m.y);
                sfx.scale = 0.005 * Blast.aoe;
                sfx.destroy();

                const targets = this.enumService.EnumUnitsInRange(new Point(m.x, m.y), Blast.aoe, target =>
                    target.isAlive());
                    
                if (targets.length > 0) {
                    
                    for (let t of targets) {
                        
                        Log.info("Hit target", t.name);

                        let tx = t.x;
                        let ty = t.y;
                        let direction = math.atan(ty - m.y, tx - m.x);
                        this.knockbackManager.ApplyKnockback(caster, t, Blast.knockForce, direction);
                    }
                }
            });

        Log.info(3)

        this.missileManager.Fire(missile);
        
        Log.info(4)
    }
}