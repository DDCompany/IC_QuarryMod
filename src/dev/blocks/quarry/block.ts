IDRegistry.genBlockID("quarry");
Block.createBlock("quarry", [{name: "Quarry", texture: [["quarry", 0]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarry, "stone", 2);

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: BlockID.quarry, count: 1, data: 0}, [
            "545",
            "323",
            "101",
        ], [
            '0', VanillaBlockID.chest, 0,
            '1', ItemID.circuitAdvanced, 0,
            '2', BlockID.quarryCasing, 0,
            '3', ItemID.storageBattery, 0,
            '4', ItemID.coreInterdimensional, 0,
            '5', ItemID.cableGold2, 0,
        ]);
    } else {
        Recipes.addShaped({id: BlockID.quarry, count: 1, data: 0}, [
            "040",
            "121",
            "313",
        ], [
            '0', VanillaItemID.gold_ingot, 0,
            '1', BlockID.quarryCasing, 0,
            '2', VanillaBlockID.diamond_block, 0,
            '3', VanillaBlockID.redstone_block, 0,
            '4', VanillaItemID.diamond_pickaxe, 0,
        ]);
    }
});