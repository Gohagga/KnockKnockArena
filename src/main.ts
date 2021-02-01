import { AbilityEventHandler } from "ability-event/AbilityEventHandler";
import { AbilityEventProvider } from "ability-event/AbilityEventProvider";
import { Order } from "config/Order";
import { DummyService } from "dummy/DummyService";
import { EnumUnitService } from "enum-service/EnumUnitService";
import { PathingService } from "enum-service/PathingService";
import { GameRound } from "game-round/GameRound";
import { Log } from "log/Log";
import { MissileManager } from "missile-system/MissileManager";
import { Knockback } from "missiles/Knockback";
import { KnockbackManager } from "missiles/KnockbackManager";
import { Blast } from "spells/Blast";
import { Dash } from "spells/Dash";
import { Launch } from "spells/Launch";
import { Snipe } from "spells/Snipe";
import { Trap } from "spells/Trap";
import { SetupUI } from "ui/Ui";
import { Item, MapPlayer, Multiboard, Point, Region, Timer, Trigger, Unit } from "w3ts";
import { Players } from "w3ts/globals";
import { OrderId } from "w3ts/globals/order";
import { addScriptHook, W3TS_HOOK } from "w3ts/hooks";

const BUILD_DATE = compiletime(() => new Date().toUTCString());
const TS_VERSION = compiletime(() => require("typescript").version);
const TSTL_VERSION = compiletime(() => require("typescript-to-lua").version);

function tsMain() {
    // print(`Build: ${BUILD_DATE}`);
    // print(`Typescript: v${TS_VERSION}`);
    // print(`Transpiler: v${TSTL_VERSION}`);
    // print(" ");
    // print("Welcome to TypeScript!");

    new Timer().start(0.00, false, () => {

        SetupUI();

        Log.info(3)
        // let score = new Multiboard();
        let score = Multiboard.fromHandle(CreateMultiboardBJ(2, 2, "Score"));
        score.setItemsWidth(0.07);
        // MultiboardSetItemValue(MultiboardGetItem(score.handle, 0, 0), "Blue");
        let redTitle = score.createItem(1, 1)
        redTitle.setValue("Red");
        redTitle.setStyle(true, false);
        let blueTitle = score.createItem(1, 2)
        blueTitle.setValue("Blue");
        blueTitle.setStyle(true, false);
        score.display(true);
        const gameRound = new GameRound(score);

        const abilityEvent = new AbilityEventHandler();
        const abilityEventProvider = new AbilityEventProvider(abilityEvent);
        const enumService = new EnumUnitService();
        const missileManager = new MissileManager();
        const dummyService = new DummyService(MapPlayer.fromIndex(PLAYER_NEUTRAL_PASSIVE), FourCC('nDUM'));
        const knockbackManager = new KnockbackManager('A00E', missileManager, dummyService, gameRound);
        const pathingService = new PathingService();

        Log.info(4)

        new Snipe({
            codeId: 'A000',
            name: 'Snipe',
        },
            abilityEvent,
            enumService,
            missileManager,
            knockbackManager
        );

        Log.info(5)

        new Launch({
            codeId: 'A002',
            name: 'Launch',
        },
            abilityEvent,
            enumService,
            missileManager,
            knockbackManager
        );

        new Blast({
            codeId: 'A005',
            name: 'Blast',
        },
            abilityEvent,
            enumService,
            missileManager,
            knockbackManager
        );

        new Trap(
            'A007',
            'A006',
            'A00C',
            'B002',
            {
                codeId: 'Amnx',
                name: 'Trap'
            },
            abilityEvent,
            enumService,
            missileManager,
            knockbackManager,
            dummyService
        );

        new Dash({
            codeId: 'A00A',
            name: 'Dash'
        },
            abilityEvent,
            enumService,
            missileManager,
            knockbackManager
        );



        let players: MapPlayer[] = [];
        let redForcePlayer = MapPlayer.fromIndex(22);
        let blueForcePlayer = MapPlayer.fromIndex(23);
        let cam = new Trigger();
        cam.addAction(() => {
            let str = GetEventPlayerChatString();
            let number: number;
            let ind = 0;
            if (str.startsWith('-cam '))
                ind = 4;
            else if (str.startsWith('-zoom '))
                ind = 5;
            number = Number(str.substring(ind, 10).trim());
            print("Camera distance set to ", number);
            SetCameraFieldForPlayer(MapPlayer.fromEvent().handle, CAMERA_FIELD_TARGET_DISTANCE, number, 0.5);
        });

        for (let i = 0; i < 12; i++) {
            let p = MapPlayer.fromIndex(i);
            if (p.slotState == PLAYER_SLOT_STATE_PLAYING && p.controller == MAP_CONTROL_USER) {
                players.push(p);

                if (i < 6) {
                    SetPlayerAlliance(redForcePlayer.handle, p.handle, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
                    SetPlayerAlliance(redForcePlayer.handle, p.handle, ALLIANCE_SHARED_CONTROL, true)
                    SetPlayerAlliance(redForcePlayer.handle, p.handle, ALLIANCE_SHARED_VISION, true)
                } else {
                    SetPlayerAlliance(blueForcePlayer.handle, p.handle, ALLIANCE_SHARED_ADVANCED_CONTROL, true)
                    SetPlayerAlliance(blueForcePlayer.handle, p.handle, ALLIANCE_SHARED_CONTROL, true)
                    SetPlayerAlliance(blueForcePlayer.handle, p.handle, ALLIANCE_SHARED_VISION, true)
                }

                const modifier = CreateFogModifierRect(p.handle, FOG_OF_WAR_VISIBLE, gg_rct_Region_000, false, true);
                FogModifierStart(modifier);

                cam.registerPlayerChatEvent(p, '-cam ', false);
                cam.registerPlayerChatEvent(p, '-zoom ', false);
            }
        }
        ClearTextMessages();

        let countdown = 5;
        const tim = new Timer();
        tim.start(1, true, () => {

            print(`Game starts in ${countdown--}`);
            if (countdown == 0) {
                tim.destroy();

                for (let player of players) {

                    let startX = player.startLocationX;
                    let startY = player.startLocationY;

                    gameRound.CreateHeroForPlayer(player, startX, startY);
                }
            }
        });

        let rune: Item | null = null;
        let spawnRate = 120;
        let runeSpawn = [gg_rct_RuneLeft, gg_rct_RuneRight];
        let index = math.floor(math.random() * 2 + 0.5);
        let runeTypes = [FourCC('rspd'), FourCC('I001')];
        let runeTimer = new Timer();
        runeTimer.start(spawnRate, true, () => {
            let spawnIndex = math.floor(math.random() + 0.5);
            let randomSpawn = runeSpawn[spawnIndex];
            let x = GetRectCenterX(randomSpawn);
            let y = GetRectCenterY(randomSpawn);
            if (rune && rune.handle) rune.destroy();
            index = math.fmod(index + 1, 2);
            rune = new Item(runeTypes[index], x, y);
        });

        let runeTimerWindow = CreateTimerDialog(runeTimer.handle);
        TimerDialogSetTitle(runeTimerWindow, "Rune");
        TimerDialogDisplay(runeTimerWindow, true);
    });
}

addScriptHook(W3TS_HOOK.MAIN_AFTER, tsMain);