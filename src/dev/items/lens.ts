IDRegistry.genItemID("quarryLensSmelt");
Item.createItem("quarryLensSmelt", "Quarry Lens (Smelt)", {name: "lens", meta: 0}, {stack: 1});

UpgradesManager.register(ItemID.quarryLensSmelt, {
    type: UpgradeType.LENS,
    singleton: true,

    processDrop(items: T_Drop): T_Drop {
        return items.map(item => {
            const result = Recipes.getFurnaceRecipeResult(item[0], item[2]);
            return result ? [result.id, result.count, result.data] : item;
        });
    },
});

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: ItemID.quarryLensSmelt, count: 1, data: 0}, [
            " 1 ",
            "101",
            " 1 ",
        ], [
            '0', VanillaBlockID.glass_pane, 0,
            '1', ItemID.dustDiamond, 0,
        ]);
    } else {
        Recipes.addShaped({id: ItemID.quarryLensSmelt, count: 1, data: 0}, [
            " 1 ",
            "101",
            " 1 ",
        ], [
            '0', VanillaBlockID.glass_pane, 0,
            '1', VanillaItemID.diamond, 0,
        ]);
    }
});