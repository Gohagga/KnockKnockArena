import { Order } from "config/Order";
import { UnitType } from "config/ObjectEditorId";
import { Log } from "log/Log";
import { OrderId } from "w3ts/globals/order";
import { Item, Leaderboard, MapPlayer, Multiboard, Timer, Trigger, Unit } from "w3ts/index";

export class GameRound {

    private flag: { red: Item, blue: Item };
    private circles: { red: Unit, blue: Unit }
    public hero: Record<number, Unit> = {};

    public redTeam: Record<number, boolean> = { 0: true, 1: true, 2: true, 3: true };
    public blueTeam: Record<number, boolean> = { 6: true, 7: true, 8: true, 9: true };
    
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

        let winGoal = 1;
        const winCondition = new Trigger();
        winCondition.registerPlayerChatEvent(MapPlayer.fromIndex(0), '-goal ', false);
        winCondition.addAction(() => {
            let msg = GetEventPlayerChatString();
            const msgNumb = Number(msg.substr(6, 10));
            if (typeof(msgNumb) == 'number') {
                winGoal = msgNumb;
                print("Win condition set to " + winGoal + " captures.");
                winCondition.destroy();
            }
        });

        let checkWinCondition = () => {
            if (redScore >= winGoal) {
                for (let p of Object.keys(this.redTeam)) {
                    let pn = Number(p);
                    CustomVictoryBJ(Player(pn), true, false);
                    CustomDefeatBJ(Player(pn + 6), 'You have lost');
                }
            } else if (blueScore >= winGoal) {
                for (let p of Object.keys(this.redTeam)) {
                    let pn = Number(p);
                    CustomVictoryBJ(Player(pn + 6), true, false);
                    CustomDefeatBJ(Player(pn), 'You have lost');
                }
            }
        };

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
                checkWinCondition();
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
                checkWinCondition();
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
                if (this.hero[playerId]) RemoveUnit(this.hero[playerId].handle);
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

        let trg = new Trigger();
        trg.registerAnyUnitEvent(EVENT_PLAYER_UNIT_PICKUP_ITEM);
        trg.addAction(() => {

            // if (GetIssuedOrderId() != Order.SMART) return;

            let item = Item.fromEvent();
            let u = Unit.fromEvent();
            // let ix = item.x;
            // let iy = item.y;
            // let { x, y } = u;

            // let pickupRange = 150;

            // if ((x-ix)*(x-ix)+(y-iy)*(y-iy) > pickupRange * pickupRange) return;

            if (item == this.flag.red && u.isAlly(MapPlayer.fromIndex(0))) {
                this.ReturnFlag(item, u);
                IssueImmediateOrderById(u.handle, OrderId.Stop);
                // u.issueImmediateOrder(Order.STOP);
            } else if (item == this.flag.blue && u.isAlly(MapPlayer.fromIndex(6))) {
                this.ReturnFlag(item, u);
                IssueImmediateOrderById(u.handle, OrderId.Stop);
                // u.issueImmediateOrder(OrderId.Stop);
            }
        });

        // trg = new Trigger();
        // trg.registerAnyUnitEvent(EVENT_PLAYER_UNIT_DEATH);
        // trg.addAction(() => {
        //     let u = Unit.fromEvent();
        //     if (u == this.hero[MapPlayer.fromEvent().id]) {
                
        //     }
        // });
        for (let p of Object.keys(this.redTeam)) {
            let pn = Number(p);
            if (Player(pn) == GetLocalPlayer()) {
                PanCameraToTimed(this.circles.red.x, this.circles.red.y, 0);
            }
        }
        for (let p of Object.keys(this.blueTeam)) {
            let pn = Number(p);
            if (Player(pn) == GetLocalPlayer()) {
                PanCameraToTimed(this.circles.blue.x, this.circles.blue.y, 0);
            }
        }

        
    }

    CreateHeroForPlayer(player: MapPlayer, x?: number, y?: number) {

        if (!x || !y) {
            if (player.id in this.redTeam) {
                x = this.circles.red.x;
                y = this.circles.red.y;
            } else if (player.id in this.blueTeam) {
                x = this.circles.blue.x;
                y = this.circles.blue.y;
            } else {
                x = 0;
                y = 0;
            }
        }
        this.hero[player.id] = new Unit(player, FourCC(UnitType.Blaster), x, y, 0);
        return this.hero[player.id];
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

    DropFlag(u: Unit) {

        // Remove the flag item from the carrier
        if (u.hasItem(this.flag.blue)) {
            u.removeItem(this.flag.blue);
            // let { x, y } = this.circles.blue;
            // u.removeItem(this.flag.blue);
            // this.flag.blue.setPosition(x, y);
        }
        if (u.hasItem(this.flag.red)) {
            u.removeItem(this.flag.red);
            // let { x, y } = this.circles.red;
            // u.removeItem(this.flag.red);
            // this.flag.red.setPosition(x, y);
        }
    }

    ReturnFlag(flag: Item, unit?: Unit) {

        // Remove the flag item from the carrier
        if (flag == this.flag.blue) {
            let { x, y } = this.circles.blue;
            if (unit) unit.removeItem(this.flag.blue);
            this.flag.blue.setPosition(x, y);
        }
        if (flag == this.flag.red) {
            let { x, y } = this.circles.red;
            if (unit) unit.removeItem(this.flag.red);
            this.flag.red.setPosition(x, y);
        }
    }
}