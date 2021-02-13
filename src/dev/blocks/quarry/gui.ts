const FONT = {
    color: android.graphics.Color.rgb(77, 77, 77),
    shadow: 0,
};
const FONT_ERROR = {
    color: android.graphics.Color.rgb(173, 10, 10),
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
        {type: "bitmap", x: 378, y: 48, bitmap: "quarry_mod.scale.energy", scale: 3.2},
        {type: "bitmap", x: 507, y: 280, bitmap: "quarry_mod.scale.exp", scale: 3.2},
        {type: "bitmap", x: 507, y: 246, bitmap: "quarry_mod.bitmap.exp", scale: 3},
        {type: "text", text: "BL", x: 786, y: 75, font: FONT},
        {type: "text", text: "WL", x: 906, y: 75, font: FONT},
    ],
    elements: {
        "energyScale": {
            type: "scale",
            x: 378,
            y: 48,
            direction: 1,
            bitmap: "quarry_mod.scale.energy_full",
            scale: 3.2,
        },
        "expScale": {type: "scale", x: 507, y: 280, bitmap: "quarry_mod.scale.exp_full", scale: 3.2},

        "buttonGetExp": {
            type: "button",
            x: 816,
            y: 240,
            bitmap: "quarry_mod.btn.exp",
            bitmap2: "quarry_mod.btn.exp_pressed",
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
            x: 886,
            y: 240,
            bitmap: "quarry_mod.btn.redstone_off",
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
            x: 370,
            y: 315,
            text: "",
            font: FONT,
        },
        "textError": {
            type: "text",
            x: 370,
            y: 315,
            text: "",
            font: FONT_ERROR,
        },
        "textExp": {type: "text", x: 539, y: 248, font: FONT},

        "switch": {
            type: "switch",
            x: 830,
            y: 52,
            scale: 2,
            bitmapOffHover: "quarry_mod.toggle.off_hover",
            bitmapOnHover: "quarry_mod.toggle.on_hover",
            clicker: {
                onClick() {
                    // soundClick.play(); //TODO
                },
            },
            onNewState: (state, container) => container?.getParent().sendEvent("whitelistChanged", {state}),
        },
    },
});

Callback.addCallback("PostLoaded", () => {
    const font = new UI.Font(FONT);
    alert(font.getTextWidth("BL", gui.getWindow("main").getScale()) + " " +
        font.getTextWidth("WL", gui.getWindow("main").getScale()));
});

{
    const elements = gui.getWindow("main").getContent().elements;

    for (let i = 0; i < 2; i++) {
        elements[`slotModule${i}`] = {
            type: "slot",
            x: 370,
            y: 100 + i * 60,
            bitmap: "quarry_mod.slot.module",
            isValid: id => UpgradesManager.isUpgrade(id),
            onItemChanged: container => container.getParent().sendEvent("upgradeChanged", {}),
        };

        elements[`slotLens${i}`] = {
            type: "slot",
            x: 370 + i * 60,
            y: 240,
            bitmap: "quarry_mod.slot.lens",
            isValid: id => UpgradesManager.isLens(id),
            onItemChanged: container => container.getParent().sendEvent("upgradeChanged", {}),
        };
    }

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 5; k++) {
            elements["slot" + (i * 5 + k)] = {type: "slot", x: 450 + k * 60, y: 40 + i * 60};
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 2; k++) {
            let slotId = i * 2 + k;
            elements["slotList" + slotId] = {
                type: "slot", x: 770 + i * 60, y: 100 + k * 60, onItemChanged(container) {
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