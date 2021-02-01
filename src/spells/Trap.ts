import { AbilityEvent } from "ability-event/AbilityEvent";
import { IAbilityEventHandler } from "ability-event/IAbilityEventHandler";
import { Ability } from "base/Ability";
import { AbilityData } from "config/AbilityData";
import { DummyService } from "dummy/DummyService";
import { IEnumUnitService } from "enum-service/IEnumUnitService";
import { Log } from "log/Log";
import { IMissile } from "missile-system/IMissile";
import { MissileManager } from "missile-system/MissileManager";
import { KnockbackManager } from "missiles/KnockbackManager";
import { TrapMissile } from "missiles/TrapMissile";
// import { TrapMissile } from "missiles/TrapMissile";
import { Effect, MapPlayer, Point, Timer, Trigger, Unit } from "w3ts/index";

export type TrapMine = {
    unit: Unit,
    angle: number,
    caster: Unit,
    sfx: Effect,
    missile: IMissile
    // tim: Timer,
    // delay: number,
}

export class Trap extends Ability {

    static readonly speed: number = 800;
    static readonly travelDistance: number = 1600;
    static readonly knockForce: number = 1000;
    static readonly maxSpeed: number = 1600;
    static readonly aoe: number = 120;
    static readonly triggerRange: number = 80;
    static readonly delay: number = 3;
    static readonly checkInterval = 0.07;

    static readonly trapUnitId = FourCC('n000');

    private instances: Record<number, TrapMine> = {};

    private allyTriggerTrapId: number;

    constructor(
        spellId: string,
        explodeSpellId: string,
        private slowSpellId: string,
        // private allyTrapTriggerSpellId: string,
        private allyTriggerTrapBuffId: string,
        data: AbilityData,
        abilityEvent: IAbilityEventHandler,
        private enumService: IEnumUnitService,
        private missileManager: MissileManager,
        private knockbackManager: KnockbackManager,
        private dummyService: DummyService
    ) {
        super(data);

        this.allyTriggerTrapId = FourCC(allyTriggerTrapBuffId);

        abilityEvent.OnAbilityEffect(FourCC(explodeSpellId), e => this.instances[e.caster.id].missile.alive = false);
        let t = new Trigger();
        t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SUMMON);
        t.addAction(() => this.PlaceTrap());

        // t = new Trigger();
        // t.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        // t.addAction(() => this.Explode(new AbilityEvent().caster));
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

        let sfx = new Effect('Abilities\\Spells\\Undead\\UndeadMine\\UndeadMineCircle.mdl', trap.x, trap.y);
        // let sfx = new Effect('Abilities\\Spells\\Undead\\Curse\\CurseTarget.mdl', trap, "origin");
        sfx.scale = 0.75;

        sfx.setYaw(angle+math.pi)

        let missile = new TrapMissile(sfx.id, trap.x, trap.y, Trap.delay);
        
        Log.info("delay?", missile.delay);
        
        missile.OnUpdate((m) => {

            // Handle repick or death
            if (!(caster.handle && caster.isAlive())) m.alive = false;

            if (m.delay >= 0) {
                m.delay -= MissileManager.fps;
                // sfx.setAlpha(math.floor(m.delay / Trap.delay * 100 - 5));
            } else if (m.delay > -100) {
                
                if (caster.owner.isPlayerEnemy(MapPlayer.fromLocal())) {
                    sfx.setAlpha(0);
                }
                m.delay = -100;

            } else {
                
                // Log.info("got in");
                const targets = this.enumService.EnumUnitsInRange(trap.point, Trap.triggerRange, target =>
                    target.typeId != Trap.trapUnitId &&
                    (target.isEnemy(owner) || caster.getAbilityLevel(this.allyTriggerTrapId) > 0) &&
                    target.isAlive());
                    
                if (targets.length > 0) {
                    Log.info(targets[0].name);
                        // trap.kill();
                    m.alive = false;
                }
            }
        }).OnDestroy((m) => {
            this.Explode(trap);
            trap.kill();
        });
        this.missileManager.Fire(missile);

        let instance = {
            unit: trap,
            angle: angle,
            caster,
            sfx,
            missile: missile
        };
        this.instances[trap.id] = instance;
    }

    Explode(trap: Unit) {

        Log.info("Explode");
        const owner = trap.owner;
        let instance = this.instances[trap.id];
        let { angle, caster, sfx, missile } = instance;
        
        Log.info(2);
        const targets = this.enumService.EnumUnitsInRange(trap.point, Trap.aoe, target =>
            target.isAlive());

        Log.info(3);
        let burst = new Effect('Abilities\\Spells\\Undead\\DarkRitual\\DarkRitualTarget.mdl', trap.x, trap.y);
        burst.setOrientation(angle, math.pi*0.5, 0);
        burst.setHeight(80);
        burst.destroy();
        sfx.destroy();

        Log.info(4);
        caster.mana += 20;

        Log.info(5);
        if (targets.length > 0) {
            for (let t of targets) {

                let tx = t.x;
                let ty = t.y;
                this.knockbackManager.RedirectForce(t, angle);
                this.knockbackManager.ApplyKnockback(caster, t, Trap.knockForce, angle, Trap.maxSpeed);
                this.dummyService.GetDummy(FourCC(this.slowSpellId), 1)
            }
        }

        delete this.instances[trap.id];
    }

    Execute(e: AbilityEvent) {

    }
}