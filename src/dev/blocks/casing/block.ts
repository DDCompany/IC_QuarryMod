IDRegistry.genBlockID("quarryCasing");
Block.createBlock("quarryCasing", [{name: "Quarry Casing", texture: [["quarry", 1]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarryCasing, "stone", 2);

Callback.addCallback("PostLoaded", () => {
    if (ModAPI.requireAPI("ICore")) {
        Recipes.addShaped({id: BlockID.quarryCasing, count: 1, data: 0}, [
            " 3 ",
            "101",
            " 2 ",
        ], [
            '0', BlockID.machineBlockAdvanced, 0,
            '1', ItemID.cableGold2, 0,
            '2', ItemID.dustDiamond, 0,
            '3', ItemID.plateGold, 0,
        ]);
    } else {
        Recipes.addShaped({id: BlockID.quarryCasing, count: 1, data: 0}, [
            "010",
            "101",
            "020",
        ], [
            '0', VanillaItemID.gold_ingot, 0,
            '1', VanillaItemID.iron_ingot, 0,
            '2', VanillaBlockID.redstone_block, 0,
        ]);
    }
});