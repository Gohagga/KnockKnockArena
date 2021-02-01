import { Frame } from "w3ts/handles/frame";
import { Timer, Trigger } from "w3ts/index";

export function SetupUI() {
    const consoleUi = Frame.fromName("ConsoleUI", 0);
    const consoleUiBackdrop = Frame.fromName("ConsoleUIBackdrop", 0);
    const gameUi = Frame.fromOrigin(ORIGIN_FRAME_GAME_UI, 0);
    const world = Frame.fromOrigin(ORIGIN_FRAME_WORLD_FRAME, 0);
    const model = Frame.fromHandle(BlzCreateFrameByType("SPRITE", "model", gameUi.handle, "", 0));
    const hiddenParent = Frame.fromHandle(BlzCreateFrameByType("SIMPLEFRAME", "", consoleUi.handle, "", 0));
    const visibleParent = Frame.fromHandle(BlzCreateFrameByType("SIMPLEFRAME", "", consoleUi.handle, "", 0));
    const bottomUi = consoleUi.getChild(1);
    const heroBar = Frame.fromOrigin(ORIGIN_FRAME_HERO_BAR, 0);

    Frame.hideOrigin(true);
    world.setAllPoints(gameUi);

    hiddenParent.visible = false;
    visibleParent.visible = true;
    consoleUi.getChild(5).visible = false;
    bottomUi.visible = true;
    
    let panel = bottomUi.getChild(0);
    panel.setParent(hiddenParent);
    panel.visible = true;
    // panel.getChild(0).visible = true;

    // for (let y = 0; y < BlzFrameGetChildrenCount(bottomUi.handle); y++) {

    //     let index = y;
    //     bottomUi.getChild(index).visible = true;
    //     print("CHILDREN COUNT: ", BlzFrameGetChildrenCount(panel.getChild(index).handle));
    
    //     let f = panel.getChild(index);
    //     for (let i = 0; i < BlzFrameGetChildrenCount(f.handle); i++) {
    //         f.getChild(i).visible = true;
    //     }
    // }

    // panel.getChild(2).visible = false;
    // panel.getChild(3).visible = false;
    // panel.getChild(4).visible = false;
    // panel.getChild(5).visible = false;
    // panel.getChild(6).visible = false;
    // panel.getChild(7).visible = false;
    // panel.getChild(8).visible = false;
    // panel.getChild(9).visible = false;
    // panel.getChild(10).visible = false;
    // panel.getChild(11).visible = false;
    // panel.getChild(12).visible = false;
    // panel.getChild(13).visible = false;
    // print("CHILDREN COUNT: ", BlzFrameGetChildrenCount(panel.handle));
    // bottomUi.getChild(2).visible = true;
    // bottomUi.getChild(1).visible = true;
    // bottomUi.getChild(2).visible = false;
    // bottomUi.getChild(3).visible = false;

    consoleUiBackdrop.visible = false;

    SetupInventory();

    // // The command buttons
    // for (let i = 0; i + 5 < 12; i++) {
    //     let frame = Frame.fromName(CommandButton_${i + 5}, 0);
    //     InitCharacterActionButton(frame, {
    //         x1: 0.264 + i * 0.04,
    //         y1: 0.045,
    //         x2: 0.3 + i * 0.04,
    //         y2: 0.061,
    //         texture: "",
    //         scale: 0.95
    //     });
    // }

    // BlzHideOriginFrames(true);
    let fh = BlzGetFrameByName("UpperButtonBarFrame", 0)
    BlzFrameSetVisible(fh, true)
    let allyButton = BlzGetFrameByName("UpperButtonBarAlliesButton", 0)
    fh = BlzGetFrameByName("UpperButtonBarMenuButton", 0)
    let chatButton = BlzGetFrameByName("UpperButtonBarChatButton", 0)
    let questButton = BlzGetFrameByName("UpperButtonBarQuestsButton", 0)
    BlzFrameClearAllPoints(fh)
    BlzFrameClearAllPoints(allyButton)
    BlzFrameClearAllPoints(chatButton)
    BlzFrameClearAllPoints(questButton)
    BlzFrameSetAbsPoint(questButton, FRAMEPOINT_TOPLEFT, 0, 0.59)// 0.85, 0.6)
    BlzFrameSetPoint(fh, FRAMEPOINT_TOP, questButton, FRAMEPOINT_BOTTOM, 0.0, 0.0)
    BlzFrameSetPoint(allyButton, FRAMEPOINT_TOP, fh, FRAMEPOINT_BOTTOM, 0.0, 0.0)
    BlzFrameSetPoint(chatButton, FRAMEPOINT_TOP, allyButton, FRAMEPOINT_BOTTOM, 0.0, 0.0)

    // BlzFrameSetAbsPoint(questButton, FRAMEPOINT_TOPLEFT, 0, 0.59)// 0.85, 0.6)
    // BlzFrameSetPoint(fh, FRAMEPOINT_TOPLEFT, questButton, FRAMEPOINT_TOPRIGHT, 0.0, 0.0)
    // BlzFrameSetPoint(allyButton, FRAMEPOINT_TOPLEFT, fh, FRAMEPOINT_TOPRIGHT, 0.0, 0.0)
    // BlzFrameSetPoint(chatButton, FRAMEPOINT_TOPLEFT, allyButton, FRAMEPOINT_TOPRIGHT, 0.0, 0.0)
  
    // fh = BlzGetFrameByName("ConsoleUIBackdrop", 0)
    // BlzFrameClearAllPoints(fh)
    // BlzFrameSetAbsPoint(fh, FRAMEPOINT_BOTTOMLEFT, 0.052, 0)
    // BlzFrameSetAbsPoint(fh, FRAMEPOINT_TOPRIGHT, 0.770, 0.141)
}

// function InitCharacterActionButton(frame: Frame, cfg: UiButton & { scale: number }) {
//     frame.clearPoints()
//         .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, cfg.x1, cfg.x2)
//         .setAbsPoint(FRAMEPOINT_TOPRIGHT, cfg.x2, cfg.y2)
//         .setScale(cfg.scale);
// }

function SetupInventory() {
    const inv0 = Frame.fromName("InventoryButton_0", 0);
    // const inv1 = Frame.fromName("InventoryButton_1", 0);
    // const inv2 = Frame.fromName("InventoryButton_2", 0);
    // const inv3 = Frame.fromName("InventoryButton_3", 0);
    // const inv4 = Frame.fromName("InventoryButton_4", 0);
    // const inv5 = Frame.fromName("InventoryButton_5", 0);

    inv0.parent.setParent(Frame.fromOrigin(ORIGIN_FRAME_COMMAND_BUTTON, 0).parent);

    // inv0.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.199, 0.045)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.216, 0.062)
    //     .setScale(0.6)
    //     .setVisible(true);

    // inv1.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.220, 0.045)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.237, 0.062)
    //     .setScale(0.6)
    //     .setVisible(true);

    // inv2.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.241, 0.045)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.258, 0.062)
    //     .setScale(0.6)
    //     .setVisible(true);

    // inv3.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.199, 0.024)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.216, 0.041)
    //     .setScale(0.6)
    //     .setVisible(true);

    // inv4.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.220, 0.024)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.237, 0.041)
    //     .setScale(0.6)
    //     .setVisible(true);

    // inv5.clearPoints()
    //     .setAbsPoint(FRAMEPOINT_BOTTOMRIGHT, 0.241, 0.024)
    //     .setAbsPoint(FRAMEPOINT_TOPRIGHT, 0.258, 0.041)
    //     .setScale(0.6)
    //     .setVisible(true);
}