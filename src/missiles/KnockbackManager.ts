import { DummyService } from "dummy/DummyService";
import { GameRound } from "game-round/GameRound";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { Item, Unit } from "w3ts/index";
import { Knockback } from "./Knockback";

export class KnockbackManager {

    private instances: Record<number, Knockback> = {};

    constructor(
        private missileManager: MissileManager,
        private dummyService: DummyService,
        private gameRound: GameRound
    ) {
        
    }

    ApplyKnockback(caster: Unit, u: Unit, force: number, angle: number) {
        
        const id = u.id;
        
        Log.info(5.1)

        // Check if unit is already affected by a knockback, if so - add the force to it
        if (id in this.instances && this.instances[id].alive) {

            Log.info(5.11)

            const existing = this.instances[id];
            // Apply the new force
            existing.AddForce(force, angle);

        } else {

            Log.info(5.121, force, angle)

            const newInstance = new Knockback(u, force, angle);
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

        if (caster.isEnemy(u.owner))
            this.gameRound.ReturnFlag(u);
    }
}