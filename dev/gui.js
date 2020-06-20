const FONT = {
    color: android.graphics.Color.rgb(77, 77, 77),
    shadow: 0
};

const gui = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "Quarry",
            }
        },
        inventory: {
            standart: true
        },
        background: {
            standart: true
        }
    },
    drawing: [
        {type: "bitmap", x: 400, y: 120, bitmap: "energy_small_background", scale: 3.2},
        {type: "bitmap", x: 595, y: 280, bitmap: "exp_bar", scale: 3.2},
        {type: "text", text: "BL", x: 815, y: 80, font: FONT},
        {type: "text", text: "WL", x: 915, y: 80, font: FONT},
    ],
    elements: {
        "energyScale": {type: "scale", x: 400, y: 120, direction: 1, bitmap: "energy_small_scale", scale: 3.2},
        "expScale": {type: "scale", x: 595, y: 280, bitmap: "exp_bar_full", scale: 3.2},
        "slotTool": {type: "slot", x: 390, y: 40},

        "slotUpgrade0": {type: "slot", x: 390, y: 180, bitmap: "slot_upgrade"},
        "slotUpgrade1": {type: "slot", x: 390, y: 240, bitmap: "slot_upgrade"},

        "slotLens0": {type: "slot", x: 470, y: 240, bitmap: "slot_lens"},
        "slotLens1": {type: "slot", x: 530, y: 240, bitmap: "slot_lens"},

        "buttonGetExp": {
            type: "button",
            x: 830,
            y: 240,
            bitmap: "btn_exp",
            bitmap2: "btn_exp_pressed",
            scale: 3.2,
            clicker: {
                onClick: function (container, tileEntity) {
                    soundClick.play();
                    Player.addExperience(tileEntity.data.exp);
                    tileEntity.data.exp = 0;
                }
            }
        },

        "buttonToggle": {
            type: "button",
            x: 900,
            y: 240,
            bitmap: "btn_redstone_off",
            scale: 3.2,
            clicker: {
                onClick: function (container, tileEntity) {
                    soundClick.play();
                    tileEntity.toggleEnable()
                }
            }
        },

        "text": {
            type: "text",
            x: 390,
            y: 320,
            text: "",
            font: FONT,
            format: true,
            multiline: true
        },
        "textExp": {type: "text", x: 595, y: 250, text: "", font: FONT},

        "switch": {
            type: "switch",
            x: 853,
            y: 58,
            scale: 2,
            bitmapOffHover: "toggle_off_hover",
            bitmapOnHover: "toggle_on_hover",
            clicker: {
                onClick: function () {
                    soundClick.play();
                }
            },
            onNewState: function (state, container) {
                if (container)
                    container.getParent().data.whitelist = state;
            }
        }
    }
});

{
    const content = gui.getWindow("main").getContentProvider().content.elements;

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 5; k++) {
            content["slot" + (i * 5 + k)] = {type: "slot", x: 470 + k * 60, y: 40 + i * 60};
        }
    }

    for (let i = 0; i < 3; i++) {
        for (let k = 0; k < 2; k++) {
            content["slotList" + (i * 2 + k)] = {type: "slot", x: 790 + i * 60, y: 100 + k * 60};
        }
    }
}