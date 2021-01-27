import { PathingService } from "enum-service/PathingService";
import { Log } from "log/Log";
import { IMissile } from "missile-system/IMissile";
import { Effect, Unit } from "w3ts/index";

export class SnipeMissile implements IMissile {

    private static readonly model = 'Abilities\\Spells\\Other\\FrostBolt\\FrostBoltMissile.mdl';
    
    id: number;
    alive: boolean;
    z: number;
    target?: Unit | undefined;

    dx: number;
    dy: number;
    sfx: Effect;

    maxDistance: number;
    travelled: number = 0;

    private onUpdate?: (missile: SnipeMissile) => void;
    private onDestroy?: (missile: SnipeMissile) => void;

    get progress() {
        return 1 - this.distance / this.maxDistance;
    }
    
    constructor(
        public x: number,
        public y: number,
        private speed: number,
        public distance: number,
        public angle: number,
    ) {
        this.sfx = new Effect(SnipeMissile.model, this.x, this.y);
        this.sfx.scale = 0.65;
        this.sfx.setYaw(angle);
        this.id = this.sfx.id;
        this.alive = true;
        this.z = 60;
        this.maxDistance = distance;

        this.dx = math.cos(angle) * speed * 0.03;
        this.dy = math.sin(angle) * speed * 0.03;
    }
    
    Update() {
        this.MoveMissile();
        this.sfx.setPosition(this.x, this.y, this.z);
        this.sfx.setYaw(this.angle);
        this.distance -= this.speed * 0.03;
        if (this.distance < 0) {
            this.alive = false;
        }
        

        this.onUpdate && this.onUpdate(this);
    }

    MoveMissile() {
        let { x, y } = this;

        // // Check if the point is pathable
        // In case a horizontal component is halted, swap force direction
        x += this.dx;
        PathingService.item.setPosition(x, y);
        if (math.abs(PathingService.item.x - x) > 0.5) {
            
            this.dx = - this.dx;
            x = this.x + this.dx;

            this.angle = math.atan(this.dy, this.dx);
        }
        y += this.dy;
        PathingService.item.setPosition(x, y);
        if (math.abs(PathingService.item.y - y) > 0.5) {

            this.dy = - this.dy;
            y = this.y + this.dy;
            this.angle = math.atan(this.dy, this.dx);
        }
        
        this.x = x;
        this.y = y;
        this.travelled += this.speed * 0.03;
    }

    Destroy() {
        Log.info("DESTROY SNIPEMISSILE")
        this.onDestroy && this.onDestroy(this);
        this.sfx.destroy();
    }

    OnUpdate(action: (this: any, missile: SnipeMissile) => void) {
        this.onUpdate = action.bind(this);
        return this;
    }

    OnDestroy(action: (this: any, missile: SnipeMissile) => void) {
        this.onDestroy = action.bind(this);
        return this;
    }
}