import { PathingService } from "enum-service/PathingService";
import { Log } from "log/Log";
import { IMissile } from "missile-system/IMissile";
import { Effect, Unit } from "w3ts/index";

export class ShellMissile implements IMissile {

    private static readonly model = 'Abilities\\Spells\\Other\\FrostBolt\\FrostBoltMissile.mdl';
    // private static readonly model = 'Abilities\\Weapons\\FrostWyrmMissile\\FrostWyrmMissile.mdl'
    private static readonly explosion = 'Abilities\\Spells\\NightElf\\Blink\\BlinkCaster.mdl';
    // private static readonly explosion = 'Units\\NightElf\\Wisp\\WispExplode.mdl';
    private static readonly arc = 0.57;
    
    id: number;
    alive: boolean;
    z: number;
    target?: Unit | undefined;

    dx: number;
    dy: number;
    sfx: Effect;
    travelled: number;

    private onUpdate?: (missile: ShellMissile) => void;
    private onDestroy?: (missile: ShellMissile) => void;
    
    constructor(
        public x: number,
        public y: number,
        private speed: number,
        public distance: number,
        public angle: number,
    ) {
        this.sfx = new Effect(ShellMissile.model, this.x, this.y);
        this.sfx.scale = 1.55;
        this.sfx.setYaw(angle);
        this.id = this.sfx.id;
        this.alive = true;
        this.z = 60;

        this.dx = math.cos(angle) * speed * 0.03;
        this.dy = math.sin(angle) * speed * 0.03;
        this.travelled = 0;
    }
    
    Update() {
        this.MoveMissile();
        Log.info(GetTerrainCliffLevel(this.x, this.y));
        this.travelled += this.speed * 0.03;

        // Curve
        let progress = math.abs(this.travelled / this.distance - 0.5);
        let height = 1 - progress * progress * 4;
        let z = ShellMissile.arc * height * this.distance;
        let pitch = math.atan(this.z - z, this.speed * 0.03);
        this.z = z;

        this.sfx.setPosition(this.x, this.y, this.z);
        this.sfx.setYaw(this.angle);
        this.sfx.setPitch(pitch)
        this.sfx.setHeight(z);
        
        if (this.travelled >= this.distance) {
            this.alive = false;
        }

        this.onUpdate && this.onUpdate(this);
    }

    MoveMissile() {
        let { x, y } = this;

        x += this.dx;
        y += this.dy;
        
        this.x = x;
        this.y = y;
    }

    Destroy() {
        Log.info("DESTROY SNIPEMISSILE")
        this.onDestroy && this.onDestroy(this);
        this.sfx.destroy();
        let eff = new Effect(ShellMissile.explosion, this.x, this.y);
        eff.scale = 2.3;
        eff.z = -50;
        eff.destroy();
    }

    OnUpdate(action: (this: any, missile: ShellMissile) => void) {
        this.onUpdate = action.bind(this);
        return this;
    }

    OnDestroy(action: (this: any, missile: ShellMissile) => void) {
        this.onDestroy = action.bind(this);
        return this;
    }
}