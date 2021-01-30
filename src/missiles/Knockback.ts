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
        
        // let dx = math.cos(angle) * force * MissileManager.fps;
        // let dy = math.sin(angle) * force * MissileManager.fps;
        // let fx = this.fx + dx;
        // let fy = this.fy + dy;
        
        // if (speedLimit) {
            
        //     {
                
        //         let currAngle = math.atan(fy, fx);
        //         let potentialSpeed = this.fx / math.cos(angle);

        //         // let potentialSpeedIncrease = speedLimit - 
        //         let scaling = potentialSpeed / speedLimit;
        //         if (potentialSpeed > speedLimit) {
        //             dx = 
        //         }
        //     }
        // }

        // Case 2 - speed is below limit but adding all of force would go over
        // - set speed to limit
        // Case 3 - speed with added force would be below limit

        this.weight = weight;
        this.fx += math.cos(angle) * force * MissileManager.fps;
        this.fy += math.sin(angle) * force * MissileManager.fps;
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