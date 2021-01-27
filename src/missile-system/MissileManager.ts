import { Log } from "log/Log";
import { Timer, Unit } from "w3ts/index";
import { IMissile } from "./IMissile";

export class MissileManager {

    public static fps = 0.03;

    private instances: Record<number, IMissile> = {};
    private updateList: IMissile[] = [];
    private lastIndex = 0;

    private timer: Timer = new Timer();

    constructor() {
        this.timer.start(MissileManager.fps, true, () => this.Update());
    }

    GetMissile(unit: Unit): IMissile | null {
        let id = unit.id;
        if (id in this.instances) return this.instances[id];
        return null;
    }

    GetMissiles(filter: (missile: IMissile) => boolean) {
        let retVal: IMissile[] = [];
        for (let m of this.updateList) {
            if (filter(m))
                retVal.push(m);
        }
        return retVal;
    }

    GetMissilesInRange(x: number, y: number, range: number, filter?: (missile: IMissile) => boolean) {
        let retVal: IMissile[] = [];
        for (let m of this.updateList) {
            let dist = (x-m.x)*(x-m.x) + (y-m.y)*(y-m.y);
            if (dist < range * range) {
                if (!filter || filter(m))
                    retVal.push(m);
            }
        }
        return retVal;
    }

    Fire(missile: IMissile) {
        if (missile.id in this.instances) {
            // Handle destroy logic?
        }

        this.instances[missile.id] = missile;
        this.updateList.push(missile);
        this.lastIndex = this.updateList.length - 1;
    }

    Update() {

        for (let i = this.updateList.length - 1; i >= 0; i--) {

            let m = this.updateList[i];
            if (m.Update) m.Update();
            if (m.alive == false) {

                Log.info(i, 'MISSILE')
                if (m.Destroy) m.Destroy();
                this.updateList[i] = this.updateList[this.lastIndex--];
                this.updateList.pop();
                delete this.instances[m.id];
            }
        }
    }
}