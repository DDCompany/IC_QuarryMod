IDRegistry.genItemID("quarryModuleBase");
Item.createItem("quarryModuleBase", "Quarry Module Base", {name: "module_base", meta: 0}, {});

IDRegistry.genItemID("quarryModuleTerritory");
Item.createItem("quarryModuleTerritory", "Quarry Module (Territory)", {name: "module", meta: 0}, {stack: 1});

UpgradesManager.register(ItemID.quarryModuleTerritory, {
    type: UpgradeType.MODULE,
    energy: 16,

    onInstall(params) {
        params.radius += 16;
    },
});


IDRegistry.genItemID("quarryModuleExpStorage");
Item.createItem("quarryModuleExpStorage", "Quarry Module (Experience Storage)", {name: "module", meta: 1},
    {stack: 1});

UpgradesManager.register(ItemID.quarryModuleExpStorage, {
    type: UpgradeType.MODULE,
    energy: 16,

    onInstall(params) {
        params.maxExp *= 2;
    },
});

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: ItemID.quarryModuleBase, count: 1, data: 0}, [
            " 3 ",
            "202",
            " 1 ",
        ], [
            '0', ItemID.plateSteel, 0,
            '1', ItemID.circuitAdvanced, 0,
            '2', ItemID.cableGold2, 0,
            '3', VanillaItemID.redstone, 0,
        ]);
    } else {
        Recipes.addShaped({id: ItemID.quarryModuleBase, count: 1, data: 0}, [
            " 2 ",
            "202",
            " 1 ",
        ], [
            '0', VanillaItemID.iron_ingot, 0,
            '1', VanillaItemID.gold_ingot, 0,
            '2', VanillaItemID.redstone, 0,
        ]);
    }

    Recipes.addShaped({id: ItemID.quarryModuleTerritory, count: 1, data: 0}, [
        " 2 ",
        "101",
        " 2 ",
    ], [
        '0', ItemID.quarryModuleBase, 0,
        '1', VanillaItemID.diamond, 0,
        '2', VanillaItemID.ender_pearl, 0,
    ]);

    Recipes.addShaped({id: ItemID.quarryModuleExpStorage, count: 1, data: 0}, [
        " 2 ",
        "101",
        " 2 ",
    ], [
        '0', ItemID.quarryModuleBase, 0,
        '1', VanillaItemID.gold_ingot, 0,
        '2', VanillaItemID.glass_bottle, 0,
    ]);
});