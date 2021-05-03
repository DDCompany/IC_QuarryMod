IDRegistry.genBlockID("quarry");
Block.createBlock("quarry", [{name: "Quarry", texture: [["quarry", 0]], inCreative: true}]);
Block.setBlockMaterial(BlockID.quarry, "stone", 2);

Item.registerNameOverrideFunction(BlockID.quarry, ((item, translation) => {
    if (item.extra) {
        const energy = item.extra.getInt("energy", 0);
        const exp = item.extra.getInt("exp", 0);
        const params = item.extra.getSerializable("params") as IQuarryParams;
        return `${translation}\n`
            + `${Translation.translate("Energy:")} ${Native.Color.GREEN}${energy}/${params.maxEnergy}EU\n`
            + `${Native.Color.WHITE}${Translation.translate(
                "Experience:")} ${Native.Color.GREEN}${exp}/${params.maxExp}●\n`
            + `${Native.Color.WHITE}${Translation.translate("Range:")} ${Native.Color.GREEN}${params.radius}m\n`;
    }

    return translation;
}));

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