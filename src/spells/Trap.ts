import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
// import { TrapMissile } from "missiles/TrapMissile";
import { Effect, Point, Trigger, Unit } from "w3ts/index";

export type TrapMine = {
    unit: Unit,
    angle: number,
    caster: Unit,
    sfx: Effect
}

export class Trap extends Ability {

    static readonly speed: number = 800;
    static readonly travelDistance: number = 1600;
    static readonly knockForce: number = 800;
    static readonly aoe: number = 70;

    private instances: Record<number, TrapMine> = {};

    constructor(
        spellId: string,
        explodeSpellId: string,
        data: AbilityData,
        abilityEvent: IAbilityEventHandler,
        private enumService: IEnumUnitService,
        private missileManager: MissileManager,
        private knockbackManager: KnockbackManager
    ) {
        super(data);
        abilityEvent.OnAbilityEffect(FourCC(explodeSpellId), e => e.caster.kill());
        let t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SUMMON);
        t.addAction(() => this.PlaceTrap());

        t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        t.addAction(() => this.Execute(new AbilityEvent()));
    }

    PlaceTrap() {

        const caster = Unit.fromHandle(GetSummoningUnit());
        const trap = Unit.fromHandle(GetSummonedUnit());
        
        Log.info("AAAAaaaaa", caster.name);
        Log.info(trap.name);

        const owner = caster.owner;

        Log.info(1)

        let { x, y } = caster;
        let targetPoint = trap.point;
        let angle = math.atan(y-targetPoint.y, x-targetPoint.x);
        let summonX = caster.x + 30 * math.cos(angle);
        let summonY = caster.y + 30 * math.sin(angle);

        // trap.x = summonX;
        // trap.y = summonY;
        // trap.setPosition(summonX, summonY);
        // trap.facing = -angle;
        let sfx = new Effect('Abilities\\Spells\\Undead\\UndeadMine\\UndeadMineCircle.mdl', trap.x, trap.y);
        sfx.scale = 0.75;
        sfx.setYaw(angle+math.pi)

        this.instances[trap.id] = {
            unit: trap,
            angle: angle,
            caster,
            sfx
        };
    }

    Execute(e: AbilityEvent) {

        
        const trap = e.caster;
        
        Log.info("AAAAaaaaa", trap.name);
        const owner = trap.owner;

        Log.info(1)

        let { angle, caster, sfx } = this.instances[trap.id];

        Log.info("saved angle and caster", angle, caster.name);

        const targets = this.enumService.EnumUnitsInRange(trap.point, Trap.aoe, target =>
            target.isAlive());

        let burst = new Effect('Abilities\\Spells\\Undead\\DarkRitual\\DarkRitualTarget.mdl', trap.x, trap.y);
        burst.setOrientation(angle, math.pi*0.5, 0);
        burst.setHeight(60);
        burst.destroy();
        sfx.destroy();

        caster.mana += 20;

                    
        if (targets.length > 0) {
            
            for (let t of targets) {
                
                Log.info("Hit target", t.name);

                let tx = t.x;
                let ty = t.y;
                this.knockbackManager.ApplyKnockback(caster, t, Trap.knockForce, angle);
            }
        }
        
        Log.info(4)
    }
}