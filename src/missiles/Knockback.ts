import { PathingService } from "enum-service/PathingService";
import { Log } from "log/Log";
import { IMissile } from "missile-system/IMissile";
import { MissileManager } from "missile-system/MissileManager";
import { Item, Unit } from "w3ts/index";

export class Knockback implements IMissile {

    public static constantDecay = 10 * MissileManager.fps * 0.3;
    public static scaleDecay = 0.92;//1 - 0.2 * MissileManager.fps;

    id: number;
    alive: boolean;
    x: number;
    y: number;
    target: Unit;
    
    fx: number = 0;
    fy: number = 0;

    constructor(
        unit: Unit,
        force: number,
        angle: number,
        private weight: number = 1
    ) {
        this.id = unit.id;
        this.alive = true;
        this.x = unit.x;
        this.y = unit.y;
        this.target = unit;

        this.AddForce(force, angle, weight);

        Log.info(this.target.name, this.fx, this.fy);
    }

    get speedPerFrame(): number {

        let angle = math.atan(this.fy, this.fx);
        return this.fx / math.cos(angle);
    }

    AddForce(force: number, angle: number, weight: number, speedLimit?: number) {
        
        let fx = this.fx + math.cos(angle) * force * MissileManager.fps;
        let fy = this.fy + math.sin(angle) * force * MissileManager.fps;
        
        if (speedLimit) {
            
            let factor = 1;
            let currAngle = math.atan(fy, fx);
            let potentialSpeed = fx / math.cos(angle);
            let limitedSpeed = speedLimit * MissileManager.fps;
            let currentSpeed = this.speedPerFrame;

            if (potentialSpeed < limitedSpeed) {
                // current potential limited
                // potential current limited
                // potential limited current
                factor = 1;

            } else if (potentialSpeed >= limitedSpeed && currentSpeed < limitedSpeed) {
                // current limited potential
                factor = limitedSpeed / potentialSpeed;

            } else if (potentialSpeed > currentSpeed && currentSpeed >= limitedSpeed) {
                // limited current potential
                factor = currentSpeed / potentialSpeed;
                
            } else if (currentSpeed >= potentialSpeed && potentialSpeed > limitedSpeed) {
                // limited potential current
                factor = 1;
            }

            // Log.info("p", potentialSpeed, "l", limitedSpeed, "c", currentSpeed);
            // Log.info("factor", factor);

            fx *= factor;
            fy *= factor;
        }

        this.weight = weight;
        this.fx = fx;//math.cos(angle) * force * MissileManager.fps;
        this.fy = fy;//math.sin(angle) * force * MissileManager.fps;
    }

    private static Decay(kb: Knockback) {

        //#region scrap code
        // // Find and preserve sign of force X and Y (1 or -1)
        // let sx = kb.fx / math.abs(kb.fx);
        // let sy = kb.fy / math.abs(kb.fy);

        // // Calculate absolute value decayed value
        // let rx = math.abs(kb.fx) * this.scaleDecay// - this.constantDecay;
        // let ry = math.abs(kb.fy) * this.scaleDecay// - this.constantDecay;

        // // Apply changes with the sign and the result in case it's higher than 0
        // kb.fx = sx * (rx > 0 ? rx : 0);
        // kb.fy = sy * (ry > 0 ? ry : 0);
        //#endregion

        kb.fx *= this.scaleDecay * kb.weight;
        kb.fy *= this.scaleDecay * kb.weight;
    }
    
    Update() {

        let { x, y } = this.target;

        // // Check if the point is pathable
        // In case a horizontal component is halted, swap force direction
        x += this.fx;
        PathingService.item.setPosition(x, y);
        if (math.abs(PathingService.item.x - x) > 0.5) {
            
            this.fx = - this.fx;
            x = this.target.x + this.fx;
        }
        y += this.fy;
        PathingService.item.setPosition(x, y);
        if (math.abs(PathingService.item.y - y) > 0.5) {

            this.fy = - this.fy;
            y = this.target.y + this.fy;
        }
        
        this.target.x = x;
        this.target.y = y;

        Knockback.Decay(this);

        if (math.abs(this.fx) + math.abs(this.fy) <= 0.3) this.alive = false;
    }

    Destroy?: () => void;
}