import { DummyService } from "dummy/DummyService";
import { GameRound } from "game-round/GameRound";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { Item, Unit } from "w3ts/index";
import { Knockback } from "./Knockback";

export class KnockbackManager {

    private instances: Record<number, Knockback> = {};

    private classWeights: Record<number, number> = {
        [FourCC('h004')]: 0.92
    }

    constructor(
        private missileManager: MissileManager,
        private dummyService: DummyService,
        private gameRound: GameRound
    ) {
        
    }

    SetWeight(u: Unit, weight?: number) {

        let id = u.id;
        // Check if unit is already affected by a knockback, if so - add the force to it
        if (id in this.instances && this.instances[id].alive) {

            const existing = this.instances[id];
            
            if (!weight) {
                if (u.id in this.classWeights) weight = this.classWeights[u.typeId];
                else weight = 1;
            }

            // Apply the new force
            existing.AddForce(0, 0, weight);

        }
    }

    ApplyKnockback(caster: Unit, u: Unit, force: number, angle: number, speedLimit?: number) {
        
        // Skip traps
        if (u.typeId == FourCC('n000')) return;
        const id = u.id;

        let weight = 1;
        if (u.typeId in this.classWeights) {
            weight = this.classWeights[u.typeId];
        }
        
        Log.info(5.1)

        // Check if unit is already affected by a knockback, if so - add the force to it
        if (id in this.instances && this.instances[id].alive) {

            Log.info(5.11)

            const existing = this.instances[id];
            // Apply the new force
            existing.AddForce(force, angle, weight, speedLimit);

        } else {

            Log.info(5.121, force, angle)

            const newInstance = new Knockback(u, force, angle, weight, speedLimit);
            Log.info(5.122, force, angle)
            this.instances[id] = newInstance;
            Log.info(5.123, force, angle)
            this.missileManager.Fire(newInstance);
            Log.info(5.124, force, angle)
        }

        const dummy = this.dummyService.GetDummy(FourCC('A001'), 1);
        dummy.x = u.x;
        dummy.y = u.y;
        dummy.issueTargetOrder('cripple', u);

        if (caster.isEnemy(u.owner) && caster.getAbilityLevel(FourCC('B000')) == 0)
            this.gameRound.ReturnFlag(u);
    }

    RedirectForce(u: Unit, angle: number) {
        
        const id = u.id;

        // Check if unit is already affected by a knockback, if so - add the force to it
        if (id in this.instances && this.instances[id].alive) {

            const existing = this.instances[id];
            // Apply the new force
            // existing.AddForce(force, angle, weight);
            let speed = existing.speedPerFrame;

            existing.fx = math.cos(angle) * speed;
            existing.fy = math.sin(angle) * speed;

        }
    }
}