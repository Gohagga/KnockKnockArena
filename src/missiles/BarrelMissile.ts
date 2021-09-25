// import { IEnumUnitService } from "enum-service/IEnumUnitService";
// import { PathingService } from "enum-service/PathingService";
// import { Log } from "log/Log";
// import { IMissile } from "missile-system/IMissile";
// import { Trap } from "spells/Trap";
// import { Effect, Point, Unit } from "w3ts/index";
// import { KnockbackManager } from "./KnockbackManager";

// export class BarrelMissile implements IMissile {
    
//     id: number;
//     alive: boolean;
//     z: number;
//     target?: Unit | undefined;

//     dx: number;
//     dy: number;

//     maxDistance: number;
//     travelled: number = 0;
    
//     constructor(
//         public unit: Unit,
//         private knockbackManager: KnockbackManager,
//         private enumService: IEnumUnitService,
//     ) {
//         this.id = this.unit.id;
//         this.alive = true;
//     }
    
//     Update() {
//         if (this.knockbackManager.IsBeingKnocked(this.unit)) {
//             const targets = this.enumService.EnumUnitsInRange(new Point(this.unit.x, this.unit.y), 70, target =>
//                     // target.typeId != Trap.trapUnitId &&
//                     target.isAlive());
                    
//             if (targets.length > 0) {
//                 this.alive = false;

//                 // Perform Knockback
//                 for (let t of targets) {

//                     // Destroy traps
//                     if (t.typeId == Trap.trapUnitId) {
//                         t.kill();
//                     } else {
//                         this.knockbackManager.ApplyKnockback
//                     }
//                 }
//             }
//         } else {
//             this.alive = false;
//         }
//     }

//     Destroy() {
//         Log.info("DESTROY BlastMISSILE")
//         this.onDestroy && this.onDestroy(this);
//         this.sfx.destroy();
//     }
// }