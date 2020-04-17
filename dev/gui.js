const gui = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "Quarry"
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
        {type: "text", text: "BL", x: 815, y: 80},
        {type: "text", text: "WL", x: 915, y: 80},
    ],
    elements: {
        "energyScale": {type: "scale", x: 400, y: 120, direction: 1, bitmap: "energy_small_scale", scale: 3.2},
        "expScale": {type: "scale", x: 595, y: 280, bitmap: "exp_bar_full", scale: 3.2},
        "slotTool": {type: "slot", x: 390, y: 40},

        "slotUpgrade0": {type: "slot", x: 390, y: 180, bitmap: "slot_upgrade"},
        "slotUpgrade1": {type: "slot", x: 390, y: 240, bitmap: "slot_upgrade"},

        "slotLens0": {type: "slot", x: 470, y: 240, bitmap: "slot_lens"},
        "slotLens1": {type: "slot", x: 530, y: 240, bitmap: "slot_lens"},

        "button": {
            type: "button", x: 900, y: 240, bitmap: "btn_exp", scale: 3.2, clicker:
                {
                    onClick: function (container, tileEntity) {
                        Player.addExperience(tileEntity.data.exp);
                        tileEntity.data.exp = 0;
                    }
                }
        },

        "text": {type: "text", x: 390, y: 320, width: 100, height: 20, text: ""},
        "textRange": {type: "text", x: 390, y: 360, width: 100, height: 20, text: ""},
        "textExp": {type: "text", x: 595, y: 250, width: 100, height: 30, text: ""},

        "switch": {
            type: "switch", x: 853, y: 58, scale: 2,
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