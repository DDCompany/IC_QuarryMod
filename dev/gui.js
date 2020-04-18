const FONT = {
    color: android.graphics.Color.rgb(77, 77, 77),
    shadow: 0
};

//From https://developer.mozilla.org/ru/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
if (!Object.assign) { //TODO: remove after js update
    Object.defineProperty(Object, 'assign', {
        enumerable: false,
        configurable: true,
        writable: true,
        value: function (target, firstSource) {
            'use strict';
            if (target === undefined || target === null) {
                throw new TypeError('Cannot convert first argument to object');
            }

            var to = Object(target);
            for (var i = 1; i < arguments.length; i++) {
                var nextSource = arguments[i];
                if (nextSource === undefined || nextSource === null) {
                    continue;
                }

                var keysArray = Object.keys(Object(nextSource));
                for (var nextIndex = 0, len = keysArray.length; nextIndex < len; nextIndex++) {
                    var nextKey = keysArray[nextIndex];
                    var desc = Object.getOwnPropertyDescriptor(nextSource, nextKey);
                    if (desc !== undefined && desc.enumerable) {
                        to[nextKey] = nextSource[nextKey];
                    }
                }
            }
            return to;
        }
    });
}

const gui = new UI.StandartWindow({
    standart: {
        header: {
            text: {
                text: "Quarry",
                font: Object.assign({}, FONT) //Because horizon add default properties
            },
            frame: "background_panel",
            color: android.graphics.Color.rgb(1, 1, 1),
            hideButton: true
        },
        inventory: {
            standart: true
        },
        background: {
            frame: {
                scale: "background_panel", //Horizon bug //TODO: remove after fix
                bitmap: "background_panel",
            }
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

        "button": {
            type: "button",
            x: 900,
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

        "text": {type: "text", x: 390, y: 320, width: 100, height: 20, text: "", font: FONT},
        "textRange": {type: "text", x: 390, y: 360, width: 100, height: 20, text: "", font: FONT},
        "textExp": {type: "text", x: 595, y: 250, width: 100, height: 30, text: "", font: FONT},

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

    //Set CLASSIC style to window
    const clazz = java.lang.Class.forName("zhekasmirnov.launcher.api.mod.ui.types.UIStyle", true, gui.getClass().getClassLoader());
    const field = clazz.getField("CLASSIC");
    field.setAccessible(true);
    gui.setStyle(field.get(null));

    //Add close button
    gui.getWindow("header").getContentProvider().content.elements["default-close-button"] = {
        type: "closeButton",
        scale: 80 / 18 * 0.75, // Copies from InnerCore
        x: 994.0 - 80 * 0.75,  //
        y: 15,
        bitmap: "close_button_default",
        bitmap2: "close_button_pressed_light"
    };
}