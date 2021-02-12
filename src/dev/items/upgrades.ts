IDRegistry.genItemID("quarryUpgradeBase");
Item.createItem("quarryUpgradeBase", "Quarry Upgrade Base", {name: "upgrade_base", meta: 0}, {});

IDRegistry.genItemID("quarryUpgradeTerritory");
Item.createItem("quarryUpgradeTerritory", "Quarry Upgrade (Territory)", {name: "upgrade", meta: 0}, {stack: 1});

UpgradesManager.register(ItemID.quarryUpgradeTerritory, {
    type: UpgradeType.UPGRADE,
    energy: 32,

    onInstall(params) {
        params.radius += 16;
    },
});

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: ItemID.quarryUpgradeBase, count: 1, data: 0}, [
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
        Recipes.addShaped({id: ItemID.quarryUpgradeBase, count: 1, data: 0}, [
            " 2 ",
            "202",
            " 1 ",
        ], [
            '0', VanillaItemID.iron_ingot, 0,
            '1', VanillaItemID.gold_ingot, 0,
            '2', VanillaItemID.redstone, 0,
        ]);
    }

    Recipes.addShaped({id: ItemID.quarryUpgradeTerritory, count: 1, data: 0}, [
        " 2 ",
        "101",
        " 2 ",
    ], [
        '0', ItemID.quarryUpgradeBase, 0,
        '1', VanillaItemID.diamond, 0,
        '2', VanillaItemID.ender_pearl, 0,
        '3', VanillaItemID.glowstone_dust, 0,
    ]);
});