import { PathingService } from "enum-service/PathingService";
import { Log } from "log/Log";
import { IMissile } from "missile-system/IMissile";
import { Effect, Unit } from "w3ts/index";

export class TrapMissile implements IMissile {

    private static readonly model = 'Abilities\\Spells\\Other\\FrostBolt\\FrostBoltMissile.mdl';
    
    id: number;
    alive: boolean;
    z: number;
    target?: Unit | undefined;

    // sfx: Effect;

    private onUpdate?: (missile: TrapMissile) => void;
    private onDestroy?: (missile: TrapMissile) => void;
    
    constructor(
        id: number,
        public x: number,
        public y: number,
        public delay: number,
    ) {
        // this.sfx = new Effect(TrapMissile.model, this.x, this.y);
        // this.sfx.scale = 0.65;
        // this.sfx.setYaw(angle);
        this.id = id;
        this.alive = true;
        this.z = 60;

        this.delay = delay;
    }
    
    Update() {
        this.onUpdate && this.onUpdate(this);
    }

    Destroy() {
        Log.info("DESTROY TrapMISSILE")
        this.onDestroy && this.onDestroy(this);
        // this.sfx.destroy();
    }

    OnUpdate(action: (this: any, missile: TrapMissile) => void) {
        this.onUpdate = action.bind(this);
        return this;
    }

    OnDestroy(action: (this: any, missile: TrapMissile) => void) {
        this.onDestroy = action.bind(this);
        return this;
    }
}