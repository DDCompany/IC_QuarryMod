const FONT = {
    color: android.graphics.Color.rgb(77, 77, 77),
    shadow: 0,
};

const gui = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "",
            },
        },
        inventory: {
            standart: true,
        },
        background: {
            standart: true,
        },
    },

    drawing: [
        {type: "bitmap", x: 400, y: 120, bitmap: "energy_small_background", scale: 3.2},
        {type: "bitmap", x: 595, y: 280, bitmap: "exp_bar", scale: 3.2},
        {type: "text", text: "BL", x: 815, y: 75, font: FONT},
        {type: "text", text: "WL", x: 915, y: 75, font: FONT},
    ],
    elements: {
        "energyScale": {type: "scale", x: 400, y: 120, direction: 1, bitmap: "energy_small_scale", scale: 3.2},
        "expScale": {type: "scale", x: 595, y: 280, bitmap: "exp_bar_full", scale: 3.2},
        "slotTool": {type: "slot", x: 390, y: 40},

        "buttonGetExp": {
            type: "button",
            x: 830,
            y: 240,
            bitmap: "btn_exp",
            bitmap2: "btn_exp_pressed",
            scale: 3.2,
            clicker: {
                onClick(container, parent) {
                    parent.sendEvent("giveExp", {player: +Player.get()});
                    // levelUpSound.play(); //TODO
                    // soundClick.play();
                },
            },
        },

        "buttonToggle": {
            type: "button",
            x: 900,
            y: 240,
            bitmap: "btn_redstone_off",
            scale: 3.2,
            clicker: {
                onClick(container, parent) {
                    // soundClick.play(); //TODO
                    parent.sendEvent("toggleEnable", {});
                },
            },
        },

        "text": {
            type: "text",
            x: 390,
            y: 320,
            text: "",
            font: FONT,
            format: true,
            multiline: true,
        },
        "textExp": {type: "text", x: 595, y: 250, text: "", font: FONT},

        "switch": {
            type: "switch",
            x: 850,
            y: 52,
            scale: 2,
            bitmapOffHover: "toggle_off_hover",
            bitmapOnHover: "toggle_on_hover",
            clicker: {
                onClick() {
                    // soundClick.play(); //TODO
                },
            },
            onNewState: (state, container) => container?.getParent().sendEvent("whitelistChanged", {state}),
        },
    },
});

{
    const elements = gui.getWindow("main").getContent().elements;

    for (let i = 0; i < 2; i++) {
        elements[`slotUpgrade${i}`] = {
            type: "slot",
            x: 390,
            y: 180 + i * 60,
            bitmap: "slot_upgrade",
            isValid: id => id === ItemID.quarryUpgradeTerritory,
            onItemChanged: container => container.getParent().sendEvent("upgradeChanged", {}),
        };

        elements[`slotLens${i}`] = {
            type: "slot",
            x: 470 + i * 60,
            y: 240,
            bitmap: "slot_lens",
            isValid: id => id === ItemID.quarryLensSmelt,
            onItemChanged: container => container.getParent().sendEvent("upgradeChanged", {}),
        };
    }

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 5; k++) {
            elements["slot" + (i * 5 + k)] = {type: "slot", x: 470 + k * 60, y: 40 + i * 60};
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 2; k++) {
            let slotId = i * 2 + k;
            elements["slotList" + slotId] = {
                type: "slot", x: 790 + i * 60, y: 100 + k * 60, onItemChanged(container) {
                    container.getParent().sendEvent("listChanged", {});
                },
            };
        }
    }
}

Callback.addCallback("LevelLoaded", () => {
    let header = gui.getWindow("header");
    let drawing = header.getContent().drawing[2] as UI.TextDrawing;
    if (drawing) {
        drawing.text = Translation.translate("Quarry");
    }
});