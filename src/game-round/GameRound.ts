import { Log } from "log/Log";
import { Item, Leaderboard, MapPlayer, Multiboard, Timer, Trigger, Unit } from "w3ts/index";

export class GameRound {

    private flag: { red: Item, blue: Item };
    private circles: { red: Unit, blue: Unit }
    public hero: Record<number, Unit> = {};
    
    constructor(
        score: Multiboard
    ) {
        
        this.circles = {
            red: Unit.fromHandle(gg_unit_ncop_0013),
            blue: Unit.fromHandle(gg_unit_ncop_0014)
        }

        this.flag = {
            red: new Item(FourCC('Iflr'), this.circles.red.x, this.circles.red.y),
            blue: new Item(FourCC('Iflb'), this.circles.blue.x, this.circles.blue.y)
        };

        let redScore = 0;
        let blueScore = 0;

        let redItem = score.createItem(2, 1);
        redItem.setStyle(true, false);
        // redItem.setWidth(0.7);
        let blueItem = score.createItem(2, 2);
        blueItem.setStyle(true, false);
        // blueItem.setWidth(10);
        redItem.setValue(redScore.toString());
        blueItem.setValue(blueScore.toString());


        let redWin = new Trigger();
        redWin.registerUnitInRage(this.circles.red.handle, 70, null);
        redWin.addAction(() => {
            let unit = Unit.fromEvent();
            if (unit.hasItem(this.flag.blue)) {
                // RED POINT

                this.ResetFlagPositions();
                redScore++;
                redItem.setValue(redScore.toString());
                blueItem.setValue(blueScore.toString());
            }
        });

        let blueWin = new Trigger();
        blueWin.registerUnitInRage(this.circles.blue.handle, 70, null);
        blueWin.addAction(() => {
            let unit = Unit.fromEvent();
            if (unit.hasItem(this.flag.red)) {
                // BLUE POINT

                this.ResetFlagPositions();
                blueScore++;
                redItem.setValue(redScore.toString());
                blueItem.setValue(blueScore.toString());
            }
        });

        let unitSelect = new Trigger();
        unitSelect.registerAnyUnitEvent(EVENT_PLAYER_UNIT_SELL);
        unitSelect.addAction(() => {

            let shop = Unit.fromEvent();
            let soldUnit = Unit.fromHandle(GetSoldUnit());
            let playerId = soldUnit.owner.id;

            let oldUnit = this.hero[playerId];

            // Check distance
            let { x, y } = oldUnit;
            if (!oldUnit || oldUnit.isAlive() == false) {
                this.hero[playerId] = soldUnit;
            } else if ((shop.x - x)*(shop.x-x)+(shop.y-y)*(shop.y-y) >= 500*500) {
                print("Cannot switch class, must be nearby.");
                RemoveUnit(soldUnit.handle);
            } else {

                if (oldUnit.hasItem(this.flag.blue) || oldUnit.hasItem(this.flag.red)) {
                    oldUnit.removeItemFromSlot(0);
                }
                RemoveUnit(oldUnit.handle);
                this.hero[playerId] = soldUnit;
            }

        });
    }

    CreateHeroForPlayer(player: MapPlayer, x: number, y: number) {
        this.hero[player.id] =  new Unit(player, FourCC('hrif'), x, y, 0);
    }

    ResetFlagPositions() {

        this.flag.red.setPosition(0, 0);
        this.flag.red.visible = false;
        this.flag.blue.setPosition(0, 0);
        this.flag.blue.visible = false;

        let tim = new Timer();
        let wind = CreateTimerDialog(tim.handle);
        TimerDialogDisplay(wind, true);

        tim.start(3, false, () => {
            this.flag.red.visible = true;
            this.flag.blue.visible = true;
            this.flag.red.setPosition(this.circles.red.x, this.circles.red.y);
            this.flag.blue.setPosition(this.circles.blue.x, this.circles.blue.y);

            DestroyTimerDialog(wind);
        });
    }

    ReturnFlag(u: Unit) {

        // Remove the flag item from the carrier
        if (u.hasItem(this.flag.blue)) {
            let { x, y } = this.circles.blue;
            u.removeItem(this.flag.blue);
            this.flag.blue.setPosition(x, y);
        }
        if (u.hasItem(this.flag.red)) {
            let { x, y } = this.circles.red;
            u.removeItem(this.flag.red);
            this.flag.red.setPosition(x, y);
        }
    }
}