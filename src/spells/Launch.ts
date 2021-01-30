import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
import { ShellMissile } from "missiles/ShellMissile";
import { SnipeMissile } from "missiles/SnipeMissile";
import { Effect, Point } from "w3ts/index";

export class Launch extends Ability {

    static readonly speed: number = 650;
    // static readonly travelDistance: number = 1500;
    static readonly knockForce: number = 1600;
    static readonly aoe = 250;

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

        let distance = DistanceBetweenPoints(caster.point.handle, e.targetPoint.handle);
        const missile = new ShellMissile(x, y, Launch.speed, distance, angle)
            .OnUpdate((m) => {

                // const targets = this.enumService.EnumUnitsInRange(new Point(m.x, m.y), 60, target =>
                //     (m.distance > 900 && target == caster) == false &&
                //     target.isAlive());
                    
                // if (targets.length > 0) {
                //     missile.target = targets[0];
                //     missile.alive = false;
                // }
            })
            .OnDestroy((m) => {

                let sfx = new Effect('war3mapImported\\Force Blast_02.mdx', m.x, m.y);
                sfx.scale = 0.005 * Launch.aoe;
                sfx.destroy();
                
                const targets = this.enumService.EnumUnitsInRange(new Point(m.x, m.y), Launch.aoe, target =>
                    target.isAlive());
                    
                if (targets.length > 0) {
                    missile.alive = false;

                    
                    for (let t of targets) {
                        
                        Log.info("Hit target", t.name);

                        let tx = t.x;
                        let ty = t.y;
                        let direction = math.atan(ty - m.y, tx - m.x);
                        this.knockbackManager.ApplyKnockback(caster, t, Launch.knockForce, direction);
                    }
                }
            });

        Log.info(3)

        this.missileManager.Fire(missile);
        
        Log.info(4)
    }
}