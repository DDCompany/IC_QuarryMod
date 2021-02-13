IDRegistry.genItemID("quarryLensSmelt");
Item.createItem("quarryLensSmelt", "Quarry Lens (Smelt)", {name: "lens", meta: 0}, {stack: 1});

UpgradesManager.register(ItemID.quarryLensSmelt, {
    type: UpgradeType.LENS,
    singleton: true,

    processDrop(items): T_Drop {
        return items.map(item => {
            const result = Recipes.getFurnaceRecipeResult(item[0], item[2]);
            return result ? [result.id, result.count, result.data] : item;
        });
    },
});

IDRegistry.genItemID("quarryLensEnchanted");
Item.createItem("quarryLensEnchanted", "Quarry Lens (Enchanted)", {name: "lens", meta: 1}, {stack: 1});
Item.setEnchantType(ItemID.quarryLensEnchanted, Native.EnchantType.pickaxe, 10);

UpgradesManager.register(ItemID.quarryLensEnchanted, {
    type: UpgradeType.LENS,

    onInstall(params, tile, slot) {
        if (slot.extra) {
            const level = slot.extra.getEnchantLevel(Native.Enchantment.EFFICIENCY);
            params.maxProgress *= 0.8 ** level;
        }
    },

    modifyExtra(extra, slot) {
        if (slot.extra) {
            const enchants = slot.extra.getEnchants();
            for (const key in enchants) {
                extra.addEnchant(+key, enchants[key]);
            }
        }
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

        Recipes.addShaped({id: ItemID.quarryLensEnchanted, count: 1, data: 0}, [
            " 2 ",
            "101",
            " 2 ",
        ], [
            '0', VanillaBlockID.glass_pane, 0,
            '1', VanillaItemID.writable_book, 0,
            '2', ItemID.dustDiamond, 0,
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

        Recipes.addShaped({id: ItemID.quarryLensEnchanted, count: 1, data: 0}, [
            " 2 ",
            "101",
            " 2 ",
        ], [
            '0', VanillaBlockID.glass_pane, 0,
            '1', VanillaItemID.writable_book, 0,
            '2', VanillaItemID.diamond, 0,
        ]);
    }
});